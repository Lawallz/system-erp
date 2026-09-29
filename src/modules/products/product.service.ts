import prisma from '../../config/prisma.js';
import type { UpdateProductInput } from './product.schema.js';
import { AppError } from '../../errors/appError.js';

export class ProductService {
  // --- CATEGORIAS ---
  async createCategory(data: { name: string; description?: string }) {
    const categoryExists = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (categoryExists) {
      throw new AppError(
        'Já existe uma categoria cadastrada com este nome',
        400,
      );
    }

    return prisma.category.create({ data });
  }

  async listCategories() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
  }

  // --- PRODUTOS ---
  async createProduct(
    data: {
      sku: string;
      name: string;
      description?: string;
      price: number;
      costPrice: number;
      minStockAlert: number;
      categoryId: string;
    },
    userId: string,
    ipAddress?: string,
  ) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (skuExists) {
      throw new AppError('Já existe um produto cadastrado com este SKU', 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Categoria informada não existe', 404);
    }

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        minStockAlert: data.minStockAlert,
        categoryId: data.categoryId,
      },
    });

    // Registrar Auditoria
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_CREATED',
        resource: 'products',
        resourceId: product.id,
        details: JSON.stringify(product),
        ipAddress,
      },
    });

    return product;
  }

  async listProducts(status: 'active' | 'inactive' | 'all' = 'active') {
    return prisma.product.findMany({
      where: status === 'all' ? {} : { isActive: status === 'active' },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateProduct(
    id: string,
    data: UpdateProductInput,
    userId: string,
    ipAddress?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const before = await tx.product.findUnique({ where: { id } });
      if (!before) throw new AppError('Produto não encontrado', 404);
      if (
        data.categoryId &&
        !(await tx.category.findUnique({ where: { id: data.categoryId } }))
      ) {
        throw new AppError('Categoria informada não existe', 404);
      }
      const product = await tx.product.update({
        where: { id },
        data,
        include: { category: true },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PRODUCT_UPDATED',
          resource: 'products',
          resourceId: id,
          details: JSON.stringify({ before, changes: data }),
          ipAddress,
        },
      });
      return product;
    });
  }

  async setActive(
    id: string,
    isActive: boolean,
    userId: string,
    ipAddress?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new AppError('Produto não encontrado', 404);
      if (product.isActive === isActive) return product;
      const updated = await tx.product.update({
        where: { id },
        data: { isActive },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: isActive ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
          resource: 'products',
          resourceId: id,
          details: JSON.stringify({ sku: product.sku, isActive }),
          ipAddress,
        },
      });
      return updated;
    });
  }
}
