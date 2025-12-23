import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar ventas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const paymentMethod = searchParams.get("paymentMethod");

    const sales = await prisma.sale.findMany({
      where: {
        storeId: session.user.storeId,
        ...(paymentMethod && { paymentMethod }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// POST - Crear venta
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      paymentMethod,
      paymentReference,
      notes,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Método de pago es requerido" },
        { status: 400 }
      );
    }

    // Verificar stock y calcular total
    let total = 0;
    const productUpdates: Array<{
      id: string;
      currentStock: number;
      newStock: number;
    }> = [];
    const stockMovements = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado` },
          { status: 404 }
        );
      }

      if (product.trackStock && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        );
      }

      total += product.price * item.quantity;

      // Preparar actualización de stock
      if (product.trackStock) {
        productUpdates.push({
          id: product.id,
          currentStock: product.stock,
          newStock: product.stock - item.quantity,
        });
      }
    }

    // Crear venta con todos los items y movimientos en transacción
    const sale = await prisma.$transaction(async (tx: any) => {
      // Crear la venta
      const newSale = await tx.sale.create({
        data: {
          total,
          paymentMethod,
          paymentReference,
          notes,
          customerName,
          customerEmail,
          customerPhone,
          storeId: session.user.storeId,
          userId: session.user.id,
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              productName: item.productName,
              productSku: item.productSku,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Actualizar stock y crear movimientos
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: { stock: update.newStock },
        });

        await tx.stockMovement.create({
          data: {
            type: "SALE",
            quantity: -(update.currentStock - update.newStock),
            previousStock: update.currentStock,
            newStock: update.newStock,
            productId: update.id,
            storeId: session.user.storeId,
            userId: session.user.id,
            saleId: newSale.id,
          },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
