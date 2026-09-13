import prisma from '../../config/prisma.js';

export class ReportService {
  async sales() {
    const sales = await prisma.sale.findMany({
      include: {
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

    const totalSales = sales.length;

    const totalRevenue = sales.reduce(
      (total, sale) => total + Number(sale.totalAmount),
      0
    );

    const averageTicket =
      totalSales > 0 ? totalRevenue / totalSales : 0;

    const productMap = new Map<
      string,
      {
        productId: string;
        sku: string;
        name: string;
        quantity: number;
        revenue: number;
      }
    >();

    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productMap.get(item.productId);

        const quantity = Number(item.quantity);
        const revenue = Number(item.subtotal);

        if (existing) {
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            sku: item.product.sku,
            name: item.product.name,
            quantity,
            revenue,
          });
        }
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      averageTicket,
      topProducts,
    };
  }

  async stock() {
    const products = await prisma.product.findMany({
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
      orderBy: {
        stockQuantity: 'asc',
      },
    });

    const totalProducts = products.length;

    const totalQuantity = products.reduce(
      (total, product) => total + product.stockQuantity,
      0
    );

    const lowStockProducts = products.filter(
      (product) =>
        product.stockQuantity <= product.minStockAlert
    );

    return {
      totalProducts,
      totalQuantity,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    };
  }

  async products() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        _count: {
          select: {
            saleItems: true,
            stockMovements: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) => product.isActive
    ).length;

    const inactiveProducts = totalProducts - activeProducts;

    const productsWithoutMovement = products.filter(
      (product) =>
        product._count.saleItems === 0 &&
        product._count.stockMovements === 0
    );

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      productsWithoutMovement,
    };
  }

  async abc() {
    const sales = await prisma.sale.findMany({
      include: {
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
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        sku: string;
        name: string;
        revenue: number;
      }
    >();

    for (const sale of sales) {
      for (const item of sale.items) {
        const revenue = Number(item.subtotal);
        const existing = productMap.get(item.productId);

        if (existing) {
          existing.revenue += revenue;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            sku: item.product.sku,
            name: item.product.name,
            revenue,
          });
        }
      }
    }

    const products = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = products.reduce(
      (total, product) => total + product.revenue,
      0
    );

    let accumulatedRevenue = 0;

    const result = products.map((product) => {
      accumulatedRevenue += product.revenue;

      const percentage =
        totalRevenue > 0
          ? (product.revenue / totalRevenue) * 100
          : 0;

      const accumulatedPercentage =
        totalRevenue > 0
          ? (accumulatedRevenue / totalRevenue) * 100
          : 0;

      let classification = 'C';

      if (accumulatedPercentage <= 80) {
        classification = 'A';
      } else if (accumulatedPercentage <= 95) {
        classification = 'B';
      }

      return {
        ...product,
        percentage: Number(percentage.toFixed(2)),
        accumulatedPercentage: Number(
          accumulatedPercentage.toFixed(2)
        ),
        classification,
      };
    });

    return {
      totalRevenue,
      products: result,
    };
  }
}