import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener reportes de inventario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "summary";

    switch (reportType) {
      case "low-stock":
        return await getLowStockReport(session.user.storeId);

      case "valuation":
        return await getInventoryValuation(session.user.storeId);

      case "summary":
      default:
        return await getInventorySummary(session.user.storeId);
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Error al obtener reportes" },
      { status: 500 }
    );
  }
}

// Productos con stock bajo
async function getLowStockReport(storeId: string) {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      trackStock: true,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const lowStock = products.filter((p: any) => p.stock <= p.minStock);

  return NextResponse.json({
    total: lowStock.length,
    products: lowStock.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.minStock,
      category: p.category.name,
      status: p.stock === 0 ? "SIN_STOCK" : "STOCK_BAJO",
    })),
  });
}

// Valorización de inventario
async function getInventoryValuation(storeId: string) {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      price: true,
      cost: true,
      category: {
        select: { name: true },
      },
    },
  });

  const valuation = products.map((p: any) => {
    const costValue = (p.cost || 0) * p.stock;
    const saleValue = p.price * p.stock;
    const potentialProfit = saleValue - costValue;
    const margin = costValue > 0 ? (potentialProfit / costValue) * 100 : 0;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      unitCost: p.cost || 0,
      unitPrice: p.price,
      costValue,
      saleValue,
      potentialProfit,
      margin: margin.toFixed(2),
      category: p.category.name,
    };
  });

  const totals = valuation.reduce(
    (acc: any, item: any) => ({
      totalCostValue: acc.totalCostValue + item.costValue,
      totalSaleValue: acc.totalSaleValue + item.saleValue,
      totalPotentialProfit: acc.totalPotentialProfit + item.potentialProfit,
    }),
    { totalCostValue: 0, totalSaleValue: 0, totalPotentialProfit: 0 }
  );

  return NextResponse.json({
    products: valuation,
    totals: {
      ...totals,
      averageMargin:
        totals.totalCostValue > 0
          ? (
              (totals.totalPotentialProfit / totals.totalCostValue) *
              100
            ).toFixed(2)
          : "0",
    },
  });
}

// Resumen general de inventario
async function getInventorySummary(storeId: string) {
  const [products, totalProducts, activeProducts, lowStockCount] =
    await Promise.all([
      prisma.product.findMany({
        where: { storeId },
        select: {
          stock: true,
          price: true,
          cost: true,
          minStock: true,
          trackStock: true,
        },
      }),
      prisma.product.count({ where: { storeId } }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.product.count({
        where: {
          storeId,
          trackStock: true,
        },
      }),
    ]);

  const lowStock = products.filter(
    (p: any) => p.trackStock && p.stock <= p.minStock
  ).length;

  const outOfStock = products.filter(
    (p: any) => p.trackStock && p.stock === 0
  ).length;

  const totalUnits = products.reduce((acc: number, p: any) => acc + p.stock, 0);
  const totalValue = products.reduce(
    (acc: number, p: any) => acc + p.price * p.stock,
    0
  );
  const totalCost = products.reduce(
    (acc: number, p: any) => acc + (p.cost || 0) * p.stock,
    0
  );

  return NextResponse.json({
    totalProducts,
    activeProducts,
    totalUnits,
    totalValue,
    totalCost,
    potentialProfit: totalValue - totalCost,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
    averagePrice: totalProducts > 0 ? totalValue / totalUnits : 0,
  });
}
