import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import {
  dateRange,
  listQuerySchema,
  pageResult,
  type ListQuery,
} from './pagination.js';

export type ListKind =
  | 'products'
  | 'categories'
  | 'suppliers'
  | 'users'
  | 'roles'
  | 'sales'
  | 'purchases'
  | 'stock'
  | 'saleCatalog'
  | 'productSales'
  | 'productPurchases'
  | 'productMovements';
async function page<T>(
  query: ListQuery,
  records: Promise<T[]>,
  count: Promise<number>,
) {
  const [items, total] = await Promise.all([records, count]);
  return pageResult(items, total, query);
}
export async function listRecords(
  kind: ListKind,
  raw: unknown,
  productId?: string,
) {
  const query = listQuerySchema.parse(raw);
  const search = { contains: query.q, mode: 'insensitive' as const };
  const createdAt = dateRange(query);
  const args = { skip: (query.page - 1) * query.limit, take: query.limit };
  return prisma.$transaction(
    async (tx) => {
      switch (kind) {
        case 'products':
        case 'saleCatalog': {
          const where: Prisma.ProductWhereInput = {
            ...(kind === 'saleCatalog' || query.status !== 'all'
              ? {
                  isActive: kind === 'saleCatalog' || query.status === 'active',
                }
              : {}),
            createdAt,
            ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            ...(query.stock === 'out'
              ? { stockQuantity: 0 }
              : query.stock === 'low'
                ? { stockQuantity: { lte: tx.product.fields.minStockAlert } }
                : {}),
            ...(query.q
              ? { OR: [{ name: search }, { sku: search }, { barcode: search }] }
              : {}),
          };
          if (kind === 'saleCatalog')
            return page(
              query,
              tx.product.findMany({
                ...args,
                where,
                orderBy: [{ name: 'asc' }, { id: 'asc' }],
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  barcode: true,
                  price: true,
                  stockQuantity: true,
                  isActive: true,
                },
              }),
              tx.product.count({ where }),
            );
          return page(
            query,
            tx.product.findMany({
              ...args,
              where,
              include: { category: true },
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            tx.product.count({ where }),
          );
        }
        case 'categories': {
          const where = {
            createdAt,
            ...(query.q
              ? { OR: [{ name: search }, { description: search }] }
              : {}),
          };
          return page(
            query,
            tx.category.findMany({
              ...args,
              where,
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            tx.category.count({ where }),
          );
        }
        case 'suppliers': {
          const where = {
            createdAt,
            ...(query.q
              ? {
                  OR: [
                    { name: search },
                    { document: search },
                    { email: search },
                  ],
                }
              : {}),
          };
          return page(
            query,
            tx.supplier.findMany({
              ...args,
              where,
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
            }),
            tx.supplier.count({ where }),
          );
        }
        case 'users': {
          const where = {
            createdAt,
            ...(query.q ? { OR: [{ name: search }, { email: search }] } : {}),
          };
          return page(
            query,
            tx.user.findMany({
              ...args,
              where,
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
              select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                isActive: true,
                createdAt: true,
                role: { select: { id: true, name: true } },
              },
            }),
            tx.user.count({ where }),
          );
        }
        case 'roles': {
          const where = { createdAt, ...(query.q ? { name: search } : {}) };
          return page(
            query,
            tx.role.findMany({
              ...args,
              where,
              orderBy: [{ name: 'asc' }, { id: 'asc' }],
              include: {
                _count: { select: { users: true, rolePermissions: true } },
              },
            }),
            tx.role.count({ where }),
          );
        }
        case 'sales': {
          const where: Prisma.SaleWhereInput = {
            createdAt,
            ...(query.q
              ? {
                  OR: [
                    { id: search },
                    { user: { name: search } },
                    {
                      items: {
                        some: {
                          product: { OR: [{ name: search }, { sku: search }] },
                        },
                      },
                    },
                  ],
                }
              : {}),
          };
          return page(
            query,
            tx.sale.findMany({
              ...args,
              where,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              include: {
                user: { select: { name: true } },
                items: {
                  include: { product: { select: { name: true, sku: true } } },
                },
              },
            }),
            tx.sale.count({ where }),
          );
        }
        case 'purchases': {
          const where: Prisma.PurchaseWhereInput = {
            createdAt,
            ...(query.q
              ? {
                  OR: [
                    { id: search },
                    { supplier: { name: search } },
                    {
                      items: {
                        some: {
                          product: { OR: [{ name: search }, { sku: search }] },
                        },
                      },
                    },
                  ],
                }
              : {}),
          };
          return page(
            query,
            tx.purchase.findMany({
              ...args,
              where,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              include: {
                supplier: { select: { name: true } },
                items: {
                  include: { product: { select: { name: true, sku: true } } },
                },
              },
            }),
            tx.purchase.count({ where }),
          );
        }
        case 'stock':
        case 'productMovements': {
          const where: Prisma.StockMovementWhereInput = {
            ...(productId ? { productId } : {}),
            createdAt,
            ...(query.q
              ? {
                  OR: [
                    { reason: search },
                    { type: search },
                    { product: { OR: [{ name: search }, { sku: search }] } },
                  ],
                }
              : {}),
          };
          return page(
            query,
            tx.stockMovement.findMany({
              ...args,
              where,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              include: {
                product: { select: { name: true, sku: true } },
                user: { select: { name: true } },
              },
            }),
            tx.stockMovement.count({ where }),
          );
        }
        case 'productSales': {
          const where: Prisma.SaleItemWhereInput = {
            productId,
            sale: { createdAt, ...(query.q ? { id: search } : {}) },
          };
          return page(
            query,
            tx.saleItem.findMany({
              ...args,
              where,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              include: {
                sale: {
                  select: {
                    id: true,
                    createdAt: true,
                    user: { select: { name: true } },
                  },
                },
              },
            }),
            tx.saleItem.count({ where }),
          );
        }
        case 'productPurchases': {
          const where: Prisma.PurchaseItemWhereInput = {
            productId,
            purchase: {
              createdAt,
              ...(query.q
                ? { OR: [{ id: search }, { supplier: { name: search } }] }
                : {}),
            },
          };
          return page(
            query,
            tx.purchaseItem.findMany({
              ...args,
              where,
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              include: {
                purchase: {
                  select: {
                    id: true,
                    createdAt: true,
                    status: true,
                    supplier: { select: { name: true } },
                  },
                },
              },
            }),
            tx.purchaseItem.count({ where }),
          );
        }
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}
export async function sendPage(req: Request, res: Response, kind: ListKind) {
  res.json({ status: 'success', data: await listRecords(kind, req.query) });
}
