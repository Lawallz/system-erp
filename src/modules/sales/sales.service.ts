import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import { CreateSaleInput } from './sales.schema.js';

export class SalesService {
  async createSale(data: CreateSaleInput, userId: string, ipAddress?: string) {const productIds = data.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  if (products.length !== data.items.length) {
    throw new AppError('Um ou mais produtos não foram encontrados', 404);
  }

  let totalAmount = 0;

  const saleItemsData: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }> = [];

  for (const item of data.items) {
    const product = products.find(
      (product) => product.id === item.productId
    );

    if (!product || !product.isActive) {
      throw new AppError(
        `Produto ${item.productId} não encontrado ou inativo`,
        400
      );
    }

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;

    totalAmount += subtotal;

    saleItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: saleItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    for (const item of saleItemsData) {
      const updatedProducts = await tx.$queryRaw<
        Array<{
          stockQuantity: number;
          sku: string;
          name: string;
        }>
      >`
        UPDATE "products"
        SET "stock_quantity" = "stock_quantity" - ${item.quantity}
        WHERE "id" = ${item.productId}
          AND "is_active" = true
          AND "stock_quantity" >= ${item.quantity}
        RETURNING "stock_quantity" AS "stockQuantity",
                  "sku",
                  "name"
      `;

      if (updatedProducts.length === 0) {
        const product = products.find(
          (product) => product.id === item.productId
        );

        throw new AppError(
          `Estoque insuficiente para o produto ${product?.name ?? item.productId}. Quantidade solicitada: ${item.quantity}`,
          400
        );
      }

      const updatedProduct = updatedProducts[0];

      const newStock = updatedProduct.stockQuantity;
      const previousStock = newStock + item.quantity;

      const movement = await tx.stockMovement.create({
        data: {
          productId: item.productId,
          userId,
          type: 'SALE',
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: `Venda #${sale.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_SALE',
          resource: 'stock',
          resourceId: movement.id,
          details: JSON.stringify({
            saleId: sale.id,
            productId: item.productId,
            sku: updatedProduct.sku,
            previousStock,
            newStock,
          }),
          ipAddress,
        },
      });
    }

    return sale;
  });

  return result;}

  async listSales() {
    return prisma.sale.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}