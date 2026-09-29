import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';

type InventoryProduct = {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  minStockAlert: number;
  price: Prisma.Decimal | string | number;
  costPrice: Prisma.Decimal | string | number;
  category: { name: string };
  purchaseItems: { quantity: number }[];
};

// This is a minimum-stock plan, not a forecast of future demand.
export function buildInventoryReport(products: InventoryProduct[]) {
  let costValue = new Prisma.Decimal(0);
  let retailValue = new Prisma.Decimal(0);
  let reorderCost = new Prisma.Decimal(0);
  const rows = products
    .map((product) => {
      const pendingQuantity = product.purchaseItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const projectedQuantity = product.stockQuantity + pendingQuantity;
      const suggestedQuantity = Math.max(
        0,
        product.minStockAlert - projectedQuantity,
      );
      const cost = new Prisma.Decimal(product.costPrice);
      const price = new Prisma.Decimal(product.price);
      const stockCost = cost.mul(product.stockQuantity);
      const stockRetail = price.mul(product.stockQuantity);
      const estimatedCost = cost.mul(suggestedQuantity);
      costValue = costValue.add(stockCost);
      retailValue = retailValue.add(stockRetail);
      reorderCost = reorderCost.add(estimatedCost);
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category.name,
        stockQuantity: product.stockQuantity,
        minStockAlert: product.minStockAlert,
        pendingQuantity,
        projectedQuantity,
        suggestedQuantity,
        costPrice: cost.toFixed(2),
        price: price.toFixed(2),
        stockCost: stockCost.toFixed(2),
        stockRetail: stockRetail.toFixed(2),
        estimatedCost: estimatedCost.toFixed(2),
        grossMarginPercent: price.gt(0)
          ? price.sub(cost).div(price).mul(100).toDecimalPlaces(2).toNumber()
          : null,
        status:
          product.stockQuantity === 0
            ? 'OUT_OF_STOCK'
            : product.stockQuantity <= product.minStockAlert
              ? 'LOW'
              : 'OK',
      };
    })
    .sort(
      (a, b) =>
        b.suggestedQuantity - a.suggestedQuantity ||
        a.stockQuantity - b.stockQuantity ||
        a.name.localeCompare(b.name, 'pt-BR'),
    );

  return {
    summary: {
      activeProducts: rows.length,
      totalUnits: rows.reduce((sum, row) => sum + row.stockQuantity, 0),
      lowStockCount: rows.filter((row) => row.status !== 'OK').length,
      productsToReorder: rows.filter((row) => row.suggestedQuantity > 0).length,
      costValue: costValue.toFixed(2),
      retailValue: retailValue.toFixed(2),
      estimatedReorderCost: reorderCost.toFixed(2),
    },
    products: rows,
  };
}

export class InventoryService {
  async overview() {
    // Keep stock and pending orders in the same database snapshot.
    const products = await prisma.$transaction(
      (tx) =>
        tx.product.findMany({
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            stockQuantity: true,
            minStockAlert: true,
            price: true,
            costPrice: true,
            category: { select: { name: true } },
            purchaseItems: {
              where: { purchase: { status: 'PENDING' } },
              select: { quantity: true },
            },
          },
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    return buildInventoryReport(products);
  }
}
