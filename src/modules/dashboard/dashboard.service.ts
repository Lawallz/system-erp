import prisma from '../../config/prisma.js';

export class DashboardService {
  async getSummary() {
    const [
      products,
      totalSales,
      totalRevenue,
      pendingPurchases,
      recentSales,
      saleItems,
      purchases,
    ] = await Promise.all([
      // Produtos ativos
      prisma.product.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          stockQuantity: true,
          minStockAlert: true,
        },
      }),

      // Quantidade total de vendas
      prisma.sale.count(),

      // Faturamento total
      prisma.sale.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),

      // Quantidade de compras pendentes
      prisma.purchase.count({
        where: {
          status: 'PENDING',
        },
      }),

      // 10 vendas mais recentes
      prisma.sale.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              subtotal: true,
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
      }),

      // Itens de todas as vendas para calcular produtos mais vendidos
      prisma.saleItem.findMany({
        select: {
          productId: true,
          quantity: true,
          subtotal: true,
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
        },
      }),

      // Compras pendentes com detalhes
      prisma.purchase.findMany({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
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
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              unitCost: true,
              subtotal: true,
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
      }),
    ]);

    const totalProducts = products.length;

    const lowStockProducts = products.filter(
      (product) =>
        product.stockQuantity <= product.minStockAlert
    );

    const lowStockCount = lowStockProducts.length;

    const revenue = Number(
      totalRevenue._sum.totalAmount ?? 0
    );

    const averageTicket =
      totalSales > 0
        ? revenue / totalSales
        : 0;

    // Agrupa os produtos vendidos
    const productSalesMap = new Map<
      string,
      {
        productId: string;
        sku: string;
        name: string;
        quantity: number;
        revenue: number;
      }
    >();

    for (const item of saleItems) {
      const existing = productSalesMap.get(item.productId);

      const quantity = item.quantity;
      const itemRevenue = Number(item.subtotal);

      if (existing) {
        existing.quantity += quantity;
        existing.revenue += itemRevenue;
      } else {
        productSalesMap.set(item.productId, {
          productId: item.productId,
          sku: item.product.sku,
          name: item.product.name,
          quantity,
          revenue: itemRevenue,
        });
      }
    }

    // Top 10 produtos mais vendidos por quantidade
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      summary: {
        totalProducts,
        lowStockCount,
        totalSales,
        totalRevenue: revenue,
        averageTicket,
        pendingPurchases,
      },

      recentSales,

      topProducts,

      lowStockProducts,

      pendingPurchases: purchases,
    };
  }
}