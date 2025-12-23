'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Package, DollarSign, Edit2, FileDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Loading from '@/components/ui/Loading';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  minStock: number;
  price: number;
  cost: number | null;
  images: string[];
  category: {
    name: string;
  };
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string | null;
  };
}

interface Report {
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  totalCost: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('ADJUSTMENT');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, movementsRes, reportRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stock-movements?limit=20'),
        fetch('/api/reports/inventory?type=summary'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }

      if (movementsRes.ok) {
        const data = await movementsRes.json();
        setMovements(data);
      }

      if (reportRes.ok) {
        const data = await reportRes.json();
        setReport(data);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const handleOpenAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setAdjustment('');
    setReason('ADJUSTMENT');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !adjustment) {
      toast.error('Complete todos los campos');
      return;
    }

    const quantity = parseInt(adjustment);
    if (isNaN(quantity) || quantity === 0) {
      toast.error('Cantidad inválida');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          reason,
          notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Stock actualizado');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'SKU', 'Categoría', 'Stock', 'Stock Mínimo', 'Precio', 'Costo', 'Valor Total'];
    const rows = products.map(p => [
      p.name,
      p.sku || '',
      p.category.name,
      p.stock,
      p.minStock,
      p.price,
      p.cost || 0,
      p.price * p.stock,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SALE: 'Venta',
      ADJUSTMENT: 'Ajuste',
      PURCHASE: 'Compra',
      RETURN: 'Devolución',
    };
    return types[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SALE: 'text-red-600 bg-red-50',
      ADJUSTMENT: 'text-blue-600 bg-blue-50',
      PURCHASE: 'text-green-600 bg-green-50',
      RETURN: 'text-yellow-600 bg-yellow-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">Gestión de stock y reportes</p>
        </div>
        <Button onClick={exportToCSV} variant="secondary">
          <FileDown className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Productos</p>
                  <p className="text-3xl font-bold">{report.totalProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.totalUnits} unidades
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Inventario</p>
                  <p className="text-3xl font-bold">{formatPrice(report.totalValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Costo: {formatPrice(report.totalCost)}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ganancia Potencial</p>
                  <p className="text-3xl font-bold">{formatPrice(report.potentialProfit)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {report.totalCost > 0
                      ? `${((report.potentialProfit / report.totalCost) * 100).toFixed(1)}% margen`
                      : '0% margen'}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Alertas de Stock</p>
                  <p className="text-3xl font-bold text-red-600">
                    {report.lowStockCount + report.outOfStockCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.outOfStockCount} sin stock
                  </p>
                </div>
                <div className="bg-red-500 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Stock Bajo */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card>
          <CardHeader
            title="⚠️ Alertas de Stock"
            description={`${lowStockProducts.length + outOfStockProducts.length} productos requieren atención`}
          />
          <CardContent>
            <div className="space-y-3">
              {outOfStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category.name}</div>
                      <div className="text-xs text-red-600 font-medium mt-1">
                        ⛔ SIN STOCK
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAdjustment(product)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Ajustar
                  </Button>
                </div>
              ))}

              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category.name}</div>
                      <div className="text-xs text-yellow-700 font-medium mt-1">
                        ⚠️ Stock: {product.stock} (Mínimo: {product.minStock})
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenAdjustment(product)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Ajustar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos Movimientos */}
      <Card>
        <CardHeader title="Últimos Movimientos de Stock" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {movement.product.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getMovementTypeColor(movement.type)}`}>
                        {getMovementTypeLabel(movement.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {movement.previousStock} → {movement.newStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {movement.reason || movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Ajuste */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Ajustar Stock - ${selectedProduct?.name}`}
      >
        {selectedProduct && (
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Stock actual</p>
              <p className="text-3xl font-bold text-gray-900">{selectedProduct.stock}</p>
            </div>

            <Input
              label="Ajuste de Stock"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              required
              placeholder="Ej: +10 o -5"
              helperText="Usa números positivos para aumentar y negativos para disminuir"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ADJUSTMENT">Ajuste Manual</option>
                <option value="PURCHASE">Compra/Reposición</option>
                <option value="RETURN">Devolución</option>
                <option value="DAMAGED">Mercadería Dañada</option>
                <option value="THEFT">Robo/Pérdida</option>
              </select>
            </div>

            <Textarea
              label="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />

            {adjustment && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nuevo stock</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedProduct.stock + parseInt(adjustment || '0')}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Guardar Ajuste
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
