export interface DashboardSummary {
  totalProducts: number;
  lowStockCount: number;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  pendingPurchases: number;
}

export interface DashboardLowStockProduct {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  minStockAlert: number;
}

export interface DashboardRecentSale {
  id: string;
  totalAmount: unknown;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
  items: {
    quantity: number;
    unitPrice: unknown;
    subtotal: unknown;
    product: {
      id: string;
      sku: string;
      name: string;
    };
  }[];
}

export interface DashboardTopProduct {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  revenue: number;
}