import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
const db = vi.hoisted(() => {
  const delegate = () => ({
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  });
  return {
    product: {
      ...delegate(),
      fields: { minStockAlert: 'field:minStockAlert' },
    },
    user: delegate(),
    sale: delegate(),
    purchase: delegate(),
    stockMovement: delegate(),
    saleItem: delegate(),
    purchaseItem: delegate(),
    category: delegate(),
    role: delegate(),
    supplier: delegate(),
    $transaction: vi.fn(),
  };
});
vi.mock('../src/config/prisma.js', () => ({ default: db }));
import app from '../src/app.js';
import { listRecords } from '../src/shared/listing.js';
import { listQuerySchema, dateRange } from '../src/shared/pagination.js';
import { updateProductSchema } from '../src/modules/products/product.schema.js';
const id = '11111111-1111-4111-8111-111111111111';
let permissions: string[];
const auth = () =>
  `Bearer ${jwt.sign({}, process.env.JWT_SECRET!, { subject: id })}`;
beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'isolated-tests-only';
  permissions = [
    'products:read',
    'sales:create',
    'sales:read',
    'purchases:read',
    'stock:read',
  ];
  db.user.findUnique.mockImplementation(async () => ({
    id,
    name: 'Operador',
    email: 'test@example.test',
    passwordHash: 'never-return',
    isActive: true,
    role: {
      name: 'Caixa',
      rolePermissions: permissions.map((name) => ({ permission: { name } })),
    },
  }));
  db.$transaction.mockImplementation(async (callback) => callback(db));
  for (const model of [
    db.product,
    db.sale,
    db.purchase,
    db.stockMovement,
    db.saleItem,
    db.purchaseItem,
    db.category,
    db.role,
    db.supplier,
    db.user,
  ]) {
    model.findMany.mockResolvedValue([]);
    model.count.mockResolvedValue(0);
  }
  db.product.findUnique.mockResolvedValue({ id, name: 'Produto' });
});
describe('session and bounded sales catalog', () => {
  it('returns current permissions without exposing password hashes', async () => {
    const result = await request(app)
      .get('/api/auth/me')
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    expect(result.body.data.permissions).toEqual(permissions);
    expect(result.body.data).not.toHaveProperty('passwordHash');
    expect(db.user.findUnique.mock.calls[0][0].select).not.toHaveProperty(
      'passwordHash',
    );
  });
  it('rejects disabled sessions', async () => {
    db.user.findUnique.mockResolvedValue({ isActive: false });
    expect(
      (await request(app).get('/api/auth/me').set('Authorization', auth()))
        .status,
    ).toBe(401);
  });
  it('allows sales-only staff to search but does not select cost price', async () => {
    permissions = ['sales:create'];
    const result = await request(app)
      .get('/api/sales/catalog?page=2&limit=10&q=001')
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    const args = db.product.findMany.mock.calls[0][0];
    expect(args).toMatchObject({
      skip: 10,
      take: 10,
      where: { isActive: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    expect(args.select).not.toHaveProperty('costPrice');
    expect(args.where.OR[2]).toEqual({
      barcode: { contains: '001', mode: 'insensitive' },
    });
  });
  it('preserves leading zeros during exact barcode lookup', async () => {
    db.product.findMany.mockResolvedValue([{ id, barcode: '00123' }]);
    const result = await request(app)
      .get('/api/sales/lookup?code=00123')
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, OR: [{ sku: '00123' }, { barcode: '00123' }] },
        take: 2,
      }),
    );
  });
  it.each([
    [[], 404],
    [[{ id }, { id: 'other' }], 409],
  ])('rejects missing or ambiguous lookup %j', async (products, status) => {
    db.product.findMany.mockResolvedValue(products);
    expect(
      (
        await request(app)
          .get('/api/sales/lookup?code=CODE')
          .set('Authorization', auth())
      ).status,
    ).toBe(status);
  });
  it('denies a catalog request without sales:create', async () => {
    permissions = ['products:read'];
    expect(
      (
        await request(app)
          .get('/api/sales/catalog')
          .set('Authorization', auth())
      ).status,
    ).toBe(403);
    expect(db.product.findMany).not.toHaveBeenCalled();
  });
});
describe('server pagination and product history', () => {
  it.each([
    { page: 0 },
    { limit: 101 },
    { from: '2026-02-30' },
    { from: '2026-10-01', to: '2026-09-29' },
    { page: 'bad' },
  ])('rejects invalid list parameters %j', (value) => {
    expect(listQuerySchema.safeParse(value).success).toBe(false);
  });
  it('includes the entire final calendar day using explicit UTC-03 boundaries', () => {
    const range = dateRange(
      listQuerySchema.parse({ from: '2026-09-29', to: '2026-09-29' }),
    );
    expect(range.gte?.toISOString()).toBe('2026-09-29T03:00:00.000Z');
    expect(range.lt?.toISOString()).toBe('2026-09-30T03:00:00.000Z');
  });
  it('counts the same filters as the page and keeps stable sorting in one snapshot', async () => {
    db.sale.count.mockResolvedValue(23);
    db.sale.findMany.mockResolvedValue([{ id }]);
    const result = await listRecords('sales', {
      page: 2,
      limit: 10,
      q: 'Mouse',
      from: '2026-09-01',
    });
    const args = db.sale.findMany.mock.calls[0][0];
    expect(db.sale.count).toHaveBeenCalledWith({ where: args.where });
    expect(args).toMatchObject({
      skip: 10,
      take: 10,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 23,
      totalPages: 3,
    });
    expect(db.$transaction.mock.calls[0][1]).toEqual({
      isolationLevel: 'RepeatableRead',
    });
  });
  it.each([
    ['sales', 'sales:read', 'saleItem'],
    ['purchases', 'purchases:read', 'purchaseItem'],
    ['movements', 'stock:read', 'stockMovement'],
  ] as const)(
    'requires both product and %s history permission',
    async (kind, permission, delegate) => {
      permissions = ['products:read'];
      const url = `/api/products/${id}/history/${kind}?page=1`;
      expect(
        (await request(app).get(url).set('Authorization', auth())).status,
      ).toBe(403);
      expect(db[delegate].findMany).not.toHaveBeenCalled();
      permissions = [permission];
      expect(
        (await request(app).get(url).set('Authorization', auth())).status,
      ).toBe(403);
      permissions = ['products:read', permission];
      expect(
        (await request(app).get(url).set('Authorization', auth())).status,
      ).toBe(200);
      expect(db[delegate].findMany.mock.calls[0][0].where.productId).toBe(id);
    },
  );
  it('returns 404 for missing products and validates UUIDs', async () => {
    db.product.findUnique.mockResolvedValue(null);
    expect(
      (
        await request(app)
          .get(`/api/products/${id}`)
          .set('Authorization', auth())
      ).status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .get('/api/products/invalid')
          .set('Authorization', auth())
      ).status,
    ).toBe(400);
  });
  it('normalizes empty barcode to null without losing leading zeros', () => {
    expect(updateProductSchema.parse({ barcode: '  ' })).toEqual({
      barcode: null,
    });
    expect(updateProductSchema.parse({ barcode: '00123' })).toEqual({
      barcode: '00123',
    });
  });
  it('returns list validation errors as HTTP 400', async () => {
    expect(
      (
        await request(app)
          .get('/api/sales?page=1&limit=999')
          .set('Authorization', auth())
      ).status,
    ).toBe(400);
    expect(db.sale.findMany).not.toHaveBeenCalled();
  });
});
