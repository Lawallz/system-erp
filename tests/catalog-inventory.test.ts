import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  product: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  category: { findUnique: vi.fn(), findMany: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('../src/config/prisma.js', () => ({ default: db }));
import app from '../src/app.js';
import { ProductService } from '../src/modules/products/product.service.js';
import { buildInventoryReport } from '../src/modules/reports/inventory.service.js';
import { updateProductSchema } from '../src/modules/products/product.schema.js';

const id = '11111111-1111-4111-8111-111111111111';
const categoryId = '22222222-2222-4222-8222-222222222222';
const product = {
  id,
  sku: 'P-01',
  name: 'Produto',
  price: '30.00',
  costPrice: '12.10',
  stockQuantity: 5,
  minStockAlert: 20,
  categoryId,
  category: { name: 'Geral' },
  purchaseItems: [{ quantity: 8 }],
  isActive: true,
};
let permissions: string[];
function auth() {
  return `Bearer ${jwt.sign({}, process.env.JWT_SECRET!, { subject: id, expiresIn: '5m' })}`;
}
beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'only-for-isolated-automated-tests';
  permissions = [
    'products:read',
    'products:update',
    'products:delete',
    'reports:read',
  ];
  db.user.findUnique.mockImplementation(async () => ({
    id,
    isActive: true,
    roleId: id,
    role: {
      rolePermissions: permissions.map((name) => ({ permission: { name } })),
    },
  }));
  db.$transaction.mockImplementation(async (callback) => callback(db));
  db.product.findUnique.mockResolvedValue(product);
  db.product.findMany.mockResolvedValue([product]);
  db.product.update.mockImplementation(async ({ data }) => ({
    ...product,
    ...data,
  }));
  db.category.findUnique.mockResolvedValue({ id: categoryId });
  db.category.findMany.mockResolvedValue([]);
  db.auditLog.create.mockResolvedValue({ id });
});
describe('catalog API and permissions', () => {
  it('requires authentication', async () => {
    expect(
      (
        await request(app)
          .put(`/api/products/${id}`)
          .send({ name: 'Novo nome' })
      ).status,
    ).toBe(401);
  });
  it('rejects update without the correct permission', async () => {
    permissions = ['products:read'];
    expect(
      (
        await request(app)
          .put(`/api/products/${id}`)
          .set('Authorization', auth())
          .send({ price: 15 })
      ).status,
    ).toBe(403);
    expect(db.product.update).not.toHaveBeenCalled();
  });
  it('updates metadata and audit in a transaction without changing stock', async () => {
    const result = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', auth())
      .send({ price: 35, name: 'Novo nome', description: '' });
    expect(result.status).toBe(200);
    expect(result.body.stockQuantity).toBe(5);
    expect(db.product.update).toHaveBeenCalledWith({
      where: { id },
      data: { price: 35, name: 'Novo nome', description: '' },
      include: { category: true },
    });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'PRODUCT_UPDATED',
          resourceId: id,
        }),
      }),
    );
  });
  it.each([
    { stockQuantity: 100 },
    { isActive: false },
    {},
    { price: -1 },
    { minStockAlert: 1.5 },
  ])('rejects invalid update %j', async (payload) => {
    const result = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', auth())
      .send(payload);
    expect(result.status).toBe(400);
    expect(db.product.update).not.toHaveBeenCalled();
  });
  it('does not reset the minimum during a partial update', () => {
    expect(updateProductSchema.parse({ price: 12 })).toEqual({ price: 12 });
  });
  it('returns 404 for unknown product or category', async () => {
    db.product.findUnique.mockResolvedValueOnce(null);
    expect(
      (
        await request(app)
          .put(`/api/products/${id}`)
          .set('Authorization', auth())
          .send({ name: 'Novo' })
      ).status,
    ).toBe(404);
    db.category.findUnique.mockResolvedValueOnce(null);
    expect(
      (
        await request(app)
          .put(`/api/products/${id}`)
          .set('Authorization', auth())
          .send({ categoryId })
      ).status,
    ).toBe(404);
    expect(db.product.update).not.toHaveBeenCalled();
  });
  it('maps duplicate SKU to a conflict instead of a generic server error', async () => {
    db.product.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '5.22.0',
      }),
    );
    expect(
      (
        await request(app)
          .put(`/api/products/${id}`)
          .set('Authorization', auth())
          .send({ sku: 'OTHER' })
      ).status,
    ).toBe(409);
  });
  it('deactivates with a reversible flag and keeps stock and history', async () => {
    const result = await request(app)
      .patch(`/api/products/${id}/deactivate`)
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    expect(result.body.isActive).toBe(false);
    expect(result.body.stockQuantity).toBe(5);
    expect(db.product.update).toHaveBeenCalledWith({
      where: { id },
      data: { isActive: false },
    });
  });
  it('keeps active-only as default and supports inactive and all filters', async () => {
    await new ProductService().listProducts();
    expect(db.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
    await request(app)
      .get('/api/products?status=inactive')
      .set('Authorization', auth());
    expect(db.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { isActive: false } }),
    );
    await request(app)
      .get('/api/products?status=all')
      .set('Authorization', auth());
    expect(db.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: {} }),
    );
    expect(
      (
        await request(app)
          .get('/api/products?status=invalid')
          .set('Authorization', auth())
      ).status,
    ).toBe(400);
  });
  it.each([
    ['get', '/api/categories'],
    ['post', '/api/categories'],
    ['put', `/api/categories/${id}`],
    ['delete', `/api/categories/${id}`],
    ['get', '/api/sales'],
    ['post', '/api/sales'],
  ])('protects %s %s with role permissions', async (method, path) => {
    permissions = [];
    const client = request(app);
    const response = await client[method as 'get'](path).set(
      'Authorization',
      auth(),
    );
    expect(response.status).toBe(403);
  });
  it('rejects an inactive user even with a previously issued token', async () => {
    db.user.findUnique.mockResolvedValueOnce({ isActive: false });
    expect(
      (await request(app).get('/api/categories').set('Authorization', auth()))
        .status,
    ).toBe(401);
  });
});
describe('inventory planning', () => {
  it('subtracts pending purchases and values with exact decimal arithmetic', () => {
    const report = buildInventoryReport([product]);
    expect(report.products[0]).toMatchObject({
      projectedQuantity: 13,
      suggestedQuantity: 7,
      estimatedCost: '84.70',
      stockCost: '60.50',
    });
    expect(report.summary).toMatchObject({
      costValue: '60.50',
      retailValue: '150.00',
      estimatedReorderCost: '84.70',
      productsToReorder: 1,
    });
  });
  it('does not suggest negative quantities when incoming stock covers the minimum', () => {
    expect(
      buildInventoryReport([{ ...product, purchaseItems: [{ quantity: 25 }] }])
        .products[0].suggestedQuantity,
    ).toBe(0);
  });
  it('handles empty inventory, zero thresholds and negative margins', () => {
    expect(buildInventoryReport([]).summary.costValue).toBe('0.00');
    const row = buildInventoryReport([
      {
        ...product,
        stockQuantity: 0,
        minStockAlert: 0,
        purchaseItems: [],
        price: 5,
      },
    ]).products[0];
    expect(row).toMatchObject({
      suggestedQuantity: 0,
      status: 'OUT_OF_STOCK',
      grossMarginPercent: -142,
    });
  });
  it('reads only active products and pending items in one consistent snapshot', async () => {
    const result = await request(app)
      .get('/api/reports/inventory')
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    expect(result.body.data.products[0].suggestedQuantity).toBe(7);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        select: expect.objectContaining({
          purchaseItems: {
            where: { purchase: { status: 'PENDING' } },
            select: { quantity: true },
          },
        }),
      }),
    );
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'RepeatableRead',
    });
  });
  it('requires reports permission', async () => {
    permissions = ['products:read'];
    expect(
      (
        await request(app)
          .get('/api/reports/inventory')
          .set('Authorization', auth())
      ).status,
    ).toBe(403);
  });
});
