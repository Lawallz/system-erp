import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';

interface StockMovementInput {
  productId: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'RETURN' | 'LOSS';
  quantity: number;
  reason?: string;
}

export class StockService {
  async registerMovement(data: StockMovementInput, userId: string, ipAddress?: string) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive) {
      throw new AppError('Produto não encontrado ou inativo', 404);
    }

    // Define se a movimentação é de entrada ou saída
    const isEntry = ['PURCHASE', 'ADJUSTMENT_IN', 'RETURN'].includes(data.type);
    const quantityChange = isEntry ? data.quantity : -data.quantity;

    const newStockQuantity = product.stockQuantity + quantityChange;

    // Impede estoque negativo para tipos que exigem validação estrita
    if (newStockQuantity < 0) {
      throw new AppError(
        `Estoque insuficiente. Estoque atual: ${product.stockQuantity}, Tentativa de retirada: ${data.quantity}`,
        400
      );
    }

    // Executa a transação atômica (Atualiza produto, cria movimentação e log de auditoria)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o saldo no produto
      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: { stockQuantity: newStockQuantity },
      });

      // 2. Registrar a movimentação de estoque
      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId,
          type: data.type,
          quantity: data.quantity,
          previousStock: product.stockQuantity,
          newStock: newStockQuantity,
          reason: data.reason,
        },
      });

      // 3. Registrar auditoria
      await tx.auditLog.create({
        data: {
          userId,
          action: `STOCK_${data.type}`,
          resource: 'stock',
          resourceId: movement.id,
          details: JSON.stringify({
            productId: data.productId,
            sku: product.sku,
            type: data.type,
            quantity: data.quantity,
            previousStock: product.stockQuantity,
            newStock: newStockQuantity,
          }),
          ipAddress,
        },
      });

      return { updatedProduct, movement };
    });

    return result;
  }

  async listMovements() {
    return prisma.stockMovement.findMany({
      include: {
        product: { select: { sku: true, name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}