import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

// GET - Obtener un producto
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar producto
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      comparePrice,
      cost,
      sku,
      stock,
      minStock,
      trackStock,
      images,
      attributes,
      isActive,
      isFeatured,
      categoryId,
    } = body;

    // Verificar que el producto existe y pertenece a la tienda
    const existing = await prisma.product.findUnique({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {
      description,
      price: price ? parseFloat(price) : undefined,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      cost: cost ? parseFloat(cost) : null,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      minStock: minStock !== undefined ? parseInt(minStock) : undefined,
      trackStock,
      images,
      attributes,
      isActive,
      isFeatured,
      categoryId,
    };

    // Si se cambia el nombre, generar nuevo slug
    if (name && name !== existing.name) {
      const slug = generateSlug(name);
      
      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese nombre' },
          { status: 400 }
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    // Si se cambia el SKU, verificar que no existe
    if (sku && sku !== existing.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: params.id },
        },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese SKU' },
          { status: 400 }
        );
      }

      updateData.sku = sku;
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
