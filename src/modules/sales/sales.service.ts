import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/AppError.js';
import { CreateSaleInput } from './sales.schema.js';

export class SalesService {
  async createSale(data: CreateSaleInput, userId: string, ipAddress?: string) {
    // 1. Validar e buscar os produtos no banco para calcular preços e verificar estoque
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== data.items.length) {
      throw new AppError('Um ou mais produtos não foram encontrados', 404);
    }

    let totalAmount = 0;
    const saleItemsData: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }> = [];
    const stockUpdates: Array<{ productId: string; newStock: number; previousStock: number; sku: string }> = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product || !product.isActive) {
        throw new AppError(`Produto ${item.productId} não encontrado ou inativo`, 400);
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stockQuantity}, Solicitado: ${item.quantity}`,
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

      stockUpdates.push({
        productId: product.id,
        newStock: product.stockQuantity - item.quantity,
        previousStock: product.stockQuantity,
        sku: product.sku,
      });
    }

    // 2. Executar a transação atômica da venda
    const result = await prisma.$transaction(async (tx) => {
      // Criar a venda principal
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

      // Atualizar o estoque de cada produto e registrar a movimentação
      for (const update of stockUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: { stockQuantity: update.newStock },
        });

        const movement = await tx.stockMovement.create({
          data: {
            productId: update.productId,
            userId,
            type: 'SALE',
            quantity: saleItemsData.find(i => i.productId === update.productId)?.quantity || 0,
            balanceAfter: update.newStock,
            reason: `Venda #${sale.id}`,
          },
        });

        // Registrar auditoria
        await tx.auditLog.create({
          data: {
            userId,
            action: 'STOCK_SALE',
            resource: 'stock',
            resourceId: movement.id,
            details: JSON.stringify({
              saleId: sale.id,
              productId: update.productId,
              sku: update.sku,
              previousStock: update.previousStock,
              newStock: update.newStock,
            }),
            ipAddress,
          },
        });
      }

      return sale;
    });

    return result;
  }

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