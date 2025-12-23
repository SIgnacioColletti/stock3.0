import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Package, FolderTree, DollarSign, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.storeId) {
    return null;
  }

  // Obtener estadísticas
  const [productsCount, categoriesCount, products, store] = await Promise.all([
    prisma.product.count({
      where: { storeId: session.user.storeId },
    }),
    prisma.category.count({
      where: { storeId: session.user.storeId },
    }),
    prisma.product.findMany({
      where: { storeId: session.user.storeId },
      select: { price: true },
    }),
    prisma.store.findUnique({
      where: { id: session.user.storeId },
    }),
  ]);

  const totalValue = products.reduce((acc: number, p: any) => acc + p.price, 0);
  const activeProducts = await prisma.product.count({
    where: { storeId: session.user.storeId, isActive: true },
  });

  const stats = [
    {
      title: "Total Productos",
      value: productsCount,
      icon: Package,
      color: "bg-blue-500",
      description: `${activeProducts} activos`,
    },
    {
      title: "Categorías",
      value: categoriesCount,
      icon: FolderTree,
      color: "bg-purple-500",
      description: "Total de categorías",
    },
    {
      title: "Valor Inventario",
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      description: store?.currency || "USD",
    },
    {
      title: "Promedio Precio",
      value:
        productsCount > 0
          ? `$${(totalValue / productsCount).toFixed(2)}`
          : "$0",
      icon: TrendingUp,
      color: "bg-orange-500",
      description: "Por producto",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de tu tienda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Acciones Rápidas" description="Gestiona tu tienda" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/products/new"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-center group"
            >
              <Package className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Nuevo Producto</h3>
              <p className="text-sm text-gray-500 mt-1">
                Agregar producto al catálogo
              </p>
            </a>

            <a
              href="/dashboard/categories"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-center group"
            >
              <FolderTree className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">
                Gestionar Categorías
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Organiza tus productos
              </p>
            </a>

            <a
              href="/dashboard/settings"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-center group"
            >
              <DollarSign className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Configuración</h3>
              <p className="text-sm text-gray-500 mt-1">
                Personaliza tu tienda
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
