'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

interface StoreSettings {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  currency: string;
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/store');
      if (!res.ok) throw new Error('Error al cargar configuración');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);

    try {
      const res = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar');
      }

      // Actualizar CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--color-primary', settings.colors.primary);
      root.style.setProperty('--color-secondary', settings.colors.secondary);
      root.style.setProperty('--color-accent', settings.colors.accent);

      toast.success('Configuración guardada');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">
          Personaliza la información y apariencia de tu tienda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <Card>
          <CardHeader title="Información General" />
          <CardContent className="space-y-4">
            <Input
              label="Nombre de la Tienda"
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
              required
              placeholder="Mi Tienda Online"
            />

            <Textarea
              label="Descripción"
              value={settings.description || ''}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              placeholder="Breve descripción de tu tienda"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <ImageUpload
                value={settings.logo ? [settings.logo] : []}
                onChange={(urls) =>
                  setSettings({ ...settings, logo: urls[0] || null })
                }
                maxImages={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader
            title="Colores de la Marca"
            description="Personaliza la paleta de colores de tu tienda"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Primario
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.colors.primary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, primary: e.target.value },
                      })
                    }
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={settings.colors.primary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, primary: e.target.value },
                      })
                    }
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.colors.secondary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, secondary: e.target.value },
                      })
                    }
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={settings.colors.secondary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, secondary: e.target.value },
                      })
                    }
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Acento
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.colors.accent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, accent: e.target.value },
                      })
                    }
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={settings.colors.accent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, accent: e.target.value },
                      })
                    }
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Vista Previa:
              </p>
              <div className="flex gap-3">
                <div
                  className="h-16 w-16 rounded-lg shadow-md"
                  style={{ backgroundColor: settings.colors.primary }}
                />
                <div
                  className="h-16 w-16 rounded-lg shadow-md"
                  style={{ backgroundColor: settings.colors.secondary }}
                />
                <div
                  className="h-16 w-16 rounded-lg shadow-md"
                  style={{ backgroundColor: settings.colors.accent }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader title="Configuración Regional" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Moneda
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">USD - Dólar</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="CLP">CLP - Peso Chileno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Zona Horaria
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/Argentina/Buenos_Aires">
                    Buenos Aires (ART)
                  </option>
                  <option value="America/Mexico_City">
                    Ciudad de México (CST)
                  </option>
                  <option value="America/Bogota">Bogotá (COT)</option>
                  <option value="America/Santiago">Santiago (CLT)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="Europe/Madrid">Madrid (CET)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
