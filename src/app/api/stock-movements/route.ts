import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar movimientos de stock
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const movements = await prisma.stockMovement.findMany({
      where: {
        storeId: session.user.storeId,
        ...(productId && { productId }),
        ...(type && { type }),
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        sale: {
          select: {
            id: true,
            total: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}

// POST - Crear ajuste manual de stock
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, reason, notes } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Producto y cantidad son requeridos' },
        { status: 400 }
      );
    }

    // Obtener producto actual
    const product = await prisma.product.findUnique({
      where: { id: productId, storeId: session.user.storeId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock no puede ser negativo' },
        { status: 400 }
      );
    }

    // Actualizar stock y crear movimiento en una transacción
    const result = await prisma.$transaction([
      // Actualizar stock del producto
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      // Crear movimiento
      prisma.stockMovement.create({
        data: {
          type: 'ADJUSTMENT',
          quantity,
          previousStock,
          newStock,
          reason,
          notes,
          productId,
          storeId: session.user.storeId,
          userId: session.user.id,
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(result[1]); // Retornar el movimiento creado
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    );
  }
}
