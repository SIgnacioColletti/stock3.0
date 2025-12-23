'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const isEditing = productId && productId !== 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    comparePrice: '',
    cost: '',
    sku: '',
    stock: '0',
    minStock: '5',
    trackStock: true,
    images: [] as string[],
    isActive: true,
    isFeatured: false,
  });

  // Dynamic attributes
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, productId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Error al cargar producto');
      const product = await res.json();

      setFormData({
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() || '',
        cost: product.cost?.toString() || '',
        sku: product.sku || '',
        stock: product.stock.toString(),
        minStock: product.minStock?.toString() || '5',
        trackStock: product.trackStock,
        images: product.images || [],
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });

      if (product.attributes && typeof product.attributes === 'object') {
        setAttributes(product.attributes);
      }
    } catch (error) {
      toast.error('Error al cargar producto');
      router.push('/dashboard/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttribute = () => {
    if (!newAttrKey || !newAttrValue) return;

    setAttributes({
      ...attributes,
      [newAttrKey]: newAttrValue,
    });
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttributes = { ...attributes };
    delete newAttributes[key];
    setAttributes(newAttributes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEditing
        ? `/api/products/${productId}`
        : '/api/products';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        attributes,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar');
      }

      toast.success(
        isEditing
          ? 'Producto actualizado'
          : 'Producto creado'
      );
      
      router.push('/dashboard/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-gray-500">
            {isEditing
              ? 'Actualiza la información del producto'
              : 'Completa los datos del nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader title="Información Básica" />
          <CardContent className="space-y-4">
            <Input
              label="Nombre del Producto"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Ej: iPhone 14 Pro, Remera Nike, etc."
            />

            <Textarea
              label="Descripción"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe las características y beneficios del producto"
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1.5 text-sm text-yellow-600">
                  Debes crear al menos una categoría primero
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader title="Precios" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Precio de Venta"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                placeholder="0.00"
              />

              <Input
                label="Precio de Comparación"
                type="number"
                step="0.01"
                min="0"
                value={formData.comparePrice}
                onChange={(e) =>
                  setFormData({ ...formData, comparePrice: e.target.value })
                }
                placeholder="0.00"
                helperText="Precio anterior o de lista"
              />

              <Input
                label="Costo"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                placeholder="0.00"
                helperText="Costo interno"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader title="Inventario" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="Código único del producto"
              />

              <Input
                label="Stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />

              <Input
                label="Stock Mínimo"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
                placeholder="Alerta cuando el stock sea igual o menor"
                helperText="Se mostrará una alerta cuando llegue a este nivel"
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackStock}
                  onChange={(e) =>
                    setFormData({ ...formData, trackStock: e.target.checked })
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Rastrear inventario
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader title="Imágenes" />
          <CardContent>
            <ImageUpload
              value={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
              maxImages={5}
            />
          </CardContent>
        </Card>

        {/* Dynamic Attributes */}
        <Card>
          <CardHeader
            title="Atributos Personalizados"
            description="Añade características específicas del producto"
          />
          <CardContent>
            {/* Existing attributes */}
            {Object.entries(attributes).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-700">
                        {key}:
                      </span>{' '}
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new attribute */}
            <div className="flex gap-2">
              <Input
                placeholder="Nombre (ej: Color, Talla)"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
              />
              <Input
                placeholder="Valor (ej: Rojo, M)"
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleAddAttribute}
                disabled={!newAttrKey || !newAttrValue}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader title="Configuración" />
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Producto activo (visible en la tienda)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Producto destacado
              </span>
            </label>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/products">
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
