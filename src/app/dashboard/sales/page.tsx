'use client';

import { useEffect, useState } from 'react';
import { Plus, DollarSign, CreditCard, Smartphone, Banknote } from 'lucide-react';
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
  price: number;
  stock: number;
  images: string[];
}

interface SaleItem {
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  paymentReference: string | null;
  customerName: string | null;
  createdAt: string;
  _count: {
    items: number;
  };
}

const paymentMethods = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote, color: 'bg-green-500' },
  { value: 'TRANSFER', label: 'Transferencia', icon: Smartphone, color: 'bg-blue-500' },
  { value: 'DEBIT', label: 'Débito', icon: CreditCard, color: 'bg-purple-500' },
  { value: 'CREDIT', label: 'Crédito', icon: CreditCard, color: 'bg-orange-500' },
  { value: 'QR', label: 'QR/MercadoPago', icon: Smartphone, color: 'bg-cyan-500' },
];

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Error al cargar ventas');
      const data = await res.json();
      setSales(data);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data.filter((p: Product) => p.stock > 0));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = (product: Product) => {
    const existing = selectedProducts.find(p => p.productId === product.id);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setSelectedProducts(
        selectedProducts.map(p =>
          p.productId === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
      toast.error('Stock insuficiente');
      return;
    }

    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    setSelectedProducts(
      selectedProducts.map(p =>
        p.productId === productId ? { ...p, quantity } : p
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedProducts,
          paymentMethod,
          paymentReference,
          notes,
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear venta');
      }

      toast.success('Venta registrada exitosamente');
      handleCloseModal();
      fetchSales();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProducts([]);
    setPaymentMethod('CASH');
    setPaymentReference('');
    setNotes('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
  };

  const getPaymentMethodInfo = (method: string) => {
    return paymentMethods.find(pm => pm.value === method);
  };

  if (isLoading) {
    return <Loading />;
  }

  const total = calculateTotal();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardHeader
          title="Ventas"
          description="Registra y consulta todas las ventas"
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          }
        />
      </Card>

      {/* Sales List */}
      {sales.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay ventas registradas
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza registrando tu primera venta
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Forma de Pago
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => {
                  const pmInfo = getPaymentMethodInfo(sale.paymentMethod);
                  const Icon = pmInfo?.icon || DollarSign;

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customerName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale._count.items} {sale._count.items === 1 ? 'producto' : 'productos'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(sale.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`${pmInfo?.color} p-2 rounded-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pmInfo?.label}
                            </div>
                            {sale.paymentReference && (
                              <div className="text-xs text-gray-500">
                                Ref: {sale.paymentReference}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Nueva Venta */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nueva Venta"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleccionar Productos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar Productos
            </label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.stock} | {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Seleccionados */}
          {selectedProducts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos en la Venta
              </label>
              <div className="border rounded-lg divide-y">
                {selectedProducts.map((item) => (
                  <div key={item.productId} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(item.price)} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, parseInt(e.target.value))
                        }
                        className="w-20"
                      />
                      <div className="font-medium w-24 text-right">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right">
                <span className="text-lg font-bold">
                  Total: {formatPrice(total)}
                </span>
              </div>
            </div>
          )}

          {/* Forma de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pago *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === pm.value
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${pm.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Referencia de Pago */}
          {paymentMethod !== 'CASH' && (
            <Input
              label="Referencia de Pago"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Nº de transferencia, últimos 4 dígitos, etc."
            />
          )}

          {/* Cliente (Opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nombre del Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Opcional"
            />
            <Input
              label="Email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Opcional"
            />
            <Input
              label="Teléfono"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {/* Notas */}
          <Textarea
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={2}
          />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Registrar Venta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
