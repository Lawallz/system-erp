import { Prisma } from "@prisma/client";
import { z } from "zod";
import { productQuerySchema, updateProductSchema } from "./product.schema.js";
import prisma from "../../config/prisma.js";
import { AppError } from "../../errors/appError.js";

export class ProductService {
  // --- CATEGORIAS ---
  async createCategory(data: { name: string; description?: string }) {
    const categoryExists = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (categoryExists) {
      throw new AppError(
        "Já existe uma categoria cadastrada com este nome",
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
      throw new AppError("Já existe um produto cadastrado com este SKU", 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Categoria informada não existe", 404);
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
        action: "PRODUCT_CREATED",
        resource: "products",
        resourceId: product.id,
        details: JSON.stringify(product),
        ipAddress,
      },
    });

    return product;
  }

  async listProducts(query: z.infer<typeof productQuerySchema>) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.sku ? { sku: query.sku } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { sku: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const options = {
      where,
      include: { category: true },
      orderBy: [{ name: "asc" as const }, { id: "asc" as const }],
    };
    // Preserve the array response for existing clients that do not request pagination.
    if (!query.page) return prisma.product.findMany(options);
    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        ...options,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    return {
      data,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
  }

  async updateProduct(
    id: string,
    data: z.infer<typeof updateProductSchema>,
    userId: string,
    ipAddress?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing || !existing.isActive)
        throw new AppError("Produto não encontrado ou inativo", 404);
      if (
        data.sku &&
        (await tx.product.findFirst({ where: { sku: data.sku, NOT: { id } } }))
      )
        throw new AppError("Já existe um produto cadastrado com este SKU", 400);
      if (
        data.categoryId &&
        !(await tx.category.findUnique({ where: { id: data.categoryId } }))
      )
        throw new AppError("Categoria informada não existe", 404);
      const product = await tx.product.update({
        where: { id },
        data,
        include: { category: true },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: "PRODUCT_UPDATED",
          resource: "products",
          resourceId: id,
          details: JSON.stringify({ before: existing, after: product }),
          ipAddress,
        },
      });
      return product;
    });
  }
}
