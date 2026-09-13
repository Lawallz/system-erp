import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import {
  CreatePurchaseInput,
  CreatePurchaseItemInput,
} from './purchase.schema.js';

export class PurchaseService {
  async create(
    data: CreatePurchaseInput,
    userId: string,
    ipAddress?: string
  ) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier || !supplier.isActive) {
      throw new AppError('Fornecedor não encontrado ou inativo', 404);
    }

    const purchase = await prisma.purchase.create({
      data: {
        supplierId: data.supplierId,
        userId,
        status: 'PENDING',
        totalAmount: 0,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'purchase',
        resourceId: purchase.id,
        details: JSON.stringify({
          supplierId: data.supplierId,
          supplierName: supplier.name,
          status: 'PENDING',
        }),
        ipAddress,
      },
    });

    return purchase;
  }

  async addItem(
    purchaseId: string,
    data: CreatePurchaseItemInput,
    userId: string,
    ipAddress?: string
  ) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new AppError('Compra não encontrada', 404);
    }

    if (purchase.status !== 'PENDING') {
      throw new AppError(
        'Não é possível adicionar itens a uma compra que não está pendente',
        400
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive) {
      throw new AppError('Produto não encontrado ou inativo', 404);
    }

    const subtotal = data.quantity * data.unitCost;

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.purchaseItem.create({
        data: {
          purchaseId,
          productId: data.productId,
          quantity: data.quantity,
          unitCost: data.unitCost,
          subtotal,
        },
      });

      const total = await tx.purchaseItem.aggregate({
        where: { purchaseId },
        _sum: {
          subtotal: true,
        },
      });

      const totalAmount = total._sum.subtotal ?? 0;

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          totalAmount,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ADD_ITEM',
          resource: 'purchase',
          resourceId: purchaseId,
          details: JSON.stringify({
            productId: data.productId,
            productName: product.name,
            quantity: data.quantity,
            unitCost: data.unitCost,
            subtotal,
            totalAmount,
          }),
          ipAddress,
        },
      });

      return {
        item,
        purchase: updatedPurchase,
      };
    });

    return result;
  }

  async list() {
    return prisma.purchase.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new AppError('Compra não encontrada', 404);
    }

    return purchase;
  }

  async receive(
    purchaseId: string,
    userId: string,
    ipAddress?: string
  ) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        items: true,
      },
    });

    if (!purchase) {
      throw new AppError('Compra não encontrada', 404);
    }

    if (purchase.status !== 'PENDING') {
      throw new AppError(
        'A compra não está pendente e não pode ser recebida',
        400
      );
    }

    if (purchase.items.length === 0) {
      throw new AppError(
        'Não é possível receber uma compra sem itens',
        400
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of purchase.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new AppError(
            `Produto ${item.productId} não encontrado ou inativo`,
            404
          );
        }

        const newStock = product.stockQuantity + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStock,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'PURCHASE',
            quantity: item.quantity,
            previousStock: product.stockQuantity,
            newStock,
            reason: `Recebimento da compra ${purchase.id}`,
          },
        });
      }

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'RECEIVED',
        },
        include: {
          supplier: true,
          items: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'RECEIVE',
          resource: 'purchase',
          resourceId: purchaseId,
          details: JSON.stringify({
            supplierId: purchase.supplierId,
            supplierName: purchase.supplier.name,
            itemCount: purchase.items.length,
            totalAmount: purchase.totalAmount,
            status: 'RECEIVED',
          }),
          ipAddress,
        },
      });

      return updatedPurchase;
    });

    return result;
  }
}