import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  purchase: { findUnique: vi.fn() },
  purchaseCosting: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('../src/config/prisma.js', () => ({ default: db }));
import app from '../src/app.js';
import {
  calculateCosting,
  fingerprint,
  type SourceItem,
} from '../src/modules/costing/costing.calculator.js';
import {
  costingSchema,
  type CostingInput,
} from '../src/modules/costing/costing.schema.js';
const id = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';
const third = '33333333-3333-4333-8333-333333333333';
const source: SourceItem[] = [
  {
    id,
    productId: id,
    quantity: 2,
    unitCost: '100',
    subtotal: '200',
    product: { name: 'Produto', sku: 'P01', price: '200' },
  },
];
function input(items = source): CostingInput {
  return {
    stage: 'ESTIMATE',
    operation: 'DOMESTIC',
    currency: 'BRL',
    exchangeRate: '1',
    reference: '',
    notes: '',
    expectedRevision: 0,
    purchaseFingerprint: fingerprint(items),
    items: items.map((item) => ({
      purchaseItemId: item.id,
      unitCost: String(item.unitCost),
    })),
    charges: [],
  };
}
function charge(
  patch: Partial<CostingInput['charges'][number]> = {},
): CostingInput['charges'][number] {
  return {
    label: 'Frete',
    kind: 'EXPENSE',
    mode: 'FIXED',
    amount: '10',
    rate: '0',
    base: '0',
    grossUp: false,
    ...patch,
  };
}
describe('decimal landed costs', () => {
  it('calculates domestic cost and gross margin with expenses and taxes', () => {
    const result = calculateCosting(
      {
        ...input(),
        charges: [
          charge(),
          charge({ label: 'Tributo', kind: 'TAX', amount: '30' }),
        ],
      },
      source,
    );
    expect(result).toMatchObject({
      goodsBRL: '200.00',
      expensesBRL: '10.00',
      taxesBRL: '30.00',
      totalBRL: '240.00',
    });
    expect(result.items[0]).toMatchObject({
      unitCostBRL: '120.000000',
      grossMarginPercent: '40.00',
    });
  });
  it.each(['COMMERCIAL_IMPORT', 'INTERNATIONAL_PARCEL'] as const)(
    'converts foreign goods once and keeps expenses in BRL for %s',
    (operation) => {
      const result = calculateCosting(
        {
          ...input(),
          operation,
          currency: 'USD',
          exchangeRate: '5.123456',
          items: [{ purchaseItemId: id, unitCost: '10' }],
          charges: [charge()],
        },
        source,
      );
      expect(result.goodsBRL).toBe('102.47');
      expect(result.totalBRL).toBe('112.47');
    },
  );
  it('supports explicit percent bases and gross-up without automatic fiscal rules', () => {
    const result = calculateCosting(
      {
        ...input(),
        charges: [
          charge({
            kind: 'TAX',
            mode: 'PERCENT',
            base: '100',
            rate: '20',
            grossUp: true,
          }),
          charge({ kind: 'TAX', mode: 'PERCENT', base: '100', rate: '20' }),
        ],
      },
      source,
    );
    expect(result.charges.map((row) => row.amountBRL)).toEqual([
      '25.00',
      '20.00',
    ]);
    expect(result.taxesBRL).toBe('45.00');
  });
  it('allocates odd cents exactly, deterministically and by item value', () => {
    const rows = [id, second, third].map((key) => ({
      ...source[0],
      id: key,
      quantity: 1,
      unitCost: '1',
      subtotal: '1',
    }));
    const result = calculateCosting(
      { ...input(rows), charges: [charge({ amount: '0.02' })] },
      [...rows].reverse(),
    );
    expect(result.items.map((row) => row.allocatedBRL)).toEqual([
      '0.01',
      '0.01',
      '0.00',
    ]);
    expect(
      result.items
        .reduce((sum, row) => sum.add(row.totalBRL), new Prisma.Decimal(0))
        .toFixed(2),
    ).toBe(result.totalBRL);
  });
  it('retains cent conservation for uneven quantities and high precision FX', () => {
    const rows = [id, second, third].map((key, i) => ({
      ...source[0],
      id: key,
      quantity: i + 1,
      unitCost: String((i + 1) * 13.17),
      subtotal: '1',
    }));
    for (const amount of ['0.01', '1.37', '99.99', '9999999999.99']) {
      const result = calculateCosting(
        {
          ...input(rows),
          currency: 'USD',
          exchangeRate: '5.173891',
          charges: [charge({ amount })],
        },
        rows,
      );
      expect(
        result.items
          .reduce(
            (sum, row) => sum.add(row.allocatedBRL),
            new Prisma.Decimal(0),
          )
          .toFixed(2),
      ).toBe(amount);
    }
  });
  it('rejects stale source items instead of silently recalculating changed purchases', () => {
    expect(() =>
      calculateCosting(input(), [{ ...source[0], quantity: 5 }]),
    ).toThrow(/mudaram/);
  });
  it('rejects omitted or substituted purchase items', () => {
    expect(() =>
      calculateCosting(
        { ...input(), items: [{ purchaseItemId: second, unitCost: '1' }] },
        source,
      ),
    ).toThrow(/exatamente/);
  });
  it.each([
    { exchangeRate: '0' },
    { currency: 'BRL', exchangeRate: '5' },
    { currency: 'USD' },
    { stage: 'ACTUAL', reference: '' },
    { charges: [charge({ mode: 'PERCENT', grossUp: true, rate: '100' })] },
    { charges: [charge({ amount: '-1' })] },
    { items: [{ purchaseItemId: id, unitCost: '1,50' }] },
    { items: [{ purchaseItemId: id, unitCost: '1e4' }] },
  ])('validates invalid input %j', (patch) => {
    expect(costingSchema.safeParse({ ...input(), ...patch }).success).toBe(
      false,
    );
  });
  it('rejects duplicate items and precision beyond supported decimals', () => {
    expect(
      costingSchema.safeParse({
        ...input(),
        items: [...input().items, ...input().items],
      }).success,
    ).toBe(false);
    expect(
      costingSchema.safeParse({
        ...input(),
        charges: [charge({ amount: '1.001' })],
      }).success,
    ).toBe(false);
  });
  it('does not mutate the purchase or its original BRL prices', () => {
    const before = JSON.stringify(source);
    calculateCosting(
      { ...input(), currency: 'EUR', exchangeRate: '6', charges: [charge()] },
      source,
    );
    expect(JSON.stringify(source)).toBe(before);
  });
});
let permissions: string[];
const auth = () =>
  `Bearer ${jwt.sign({}, process.env.JWT_SECRET!, { subject: id })}`;
beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'isolated-costing-tests';
  permissions = ['purchases:read', 'purchases:create'];
  db.user.findUnique.mockImplementation(async () => ({
    id,
    isActive: true,
    role: {
      rolePermissions: permissions.map((name) => ({ permission: { name } })),
    },
  }));
  db.purchase.findUnique.mockResolvedValue({
    id,
    items: source,
    supplier: { name: 'Fornecedor' },
  });
  db.purchaseCosting.findFirst.mockResolvedValue(null);
  db.purchaseCosting.findMany.mockResolvedValue([]);
  db.purchaseCosting.create.mockImplementation(async ({ data }) => ({
    id: second,
    ...data,
  }));
  db.$transaction.mockImplementation(async (callback) => callback(db));
});
describe('costing API and immutable revisions', () => {
  it('requires authentication and purchase read access', async () => {
    expect(
      (await request(app).get(`/api/purchases/${id}/costing`)).status,
    ).toBe(401);
    permissions = ['products:read'];
    expect(
      (
        await request(app)
          .get(`/api/purchases/${id}/costing`)
          .set('Authorization', auth())
      ).status,
    ).toBe(403);
    expect(db.purchase.findUnique).not.toHaveBeenCalled();
  });
  it('allows read-only simulation but blocks saving', async () => {
    permissions = ['purchases:read'];
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing/preview`)
          .set('Authorization', auth())
          .send(input())
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing`)
          .set('Authorization', auth())
          .send(input())
      ).status,
    ).toBe(403);
    expect(db.purchaseCosting.create).not.toHaveBeenCalled();
  });
  it('returns source fingerprint and bounded history', async () => {
    const result = await request(app)
      .get(`/api/purchases/${id}/costing`)
      .set('Authorization', auth());
    expect(result.status).toBe(200);
    expect(result.body.data.purchaseFingerprint).toBe(fingerprint(source));
    expect(db.purchaseCosting.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });
  it('saves a calculated snapshot and audit in one serializable transaction', async () => {
    const result = await request(app)
      .post(`/api/purchases/${id}/costing`)
      .set('Authorization', auth())
      .send(input());
    expect(result.status).toBe(201);
    expect(result.body.data.revision).toBe(1);
    expect(result.body.data.output.totalBRL).toBe('200.00');
    expect(db.auditLog.create).toHaveBeenCalledOnce();
    expect(db.$transaction.mock.calls[0][1]).toEqual({
      isolationLevel: 'Serializable',
    });
  });
  it('blocks stale revisions and prevents duplicate save requests', async () => {
    db.purchaseCosting.findFirst.mockResolvedValue({ revision: 1 });
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing`)
          .set('Authorization', auth())
          .send(input())
      ).status,
    ).toBe(409);
    expect(db.purchaseCosting.create).not.toHaveBeenCalled();
  });
  it('returns 409 for a database concurrency conflict', async () => {
    db.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('conflict', {
        code: 'P2034',
        clientVersion: '5.22.0',
      }),
    );
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing`)
          .set('Authorization', auth())
          .send(input())
      ).status,
    ).toBe(409);
  });
  it('rejects invalid payloads and missing purchases', async () => {
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing/preview`)
          .set('Authorization', auth())
          .send({ ...input(), output: { totalBRL: '0' } })
      ).status,
    ).toBe(400);
    db.purchase.findUnique.mockResolvedValue(null);
    expect(
      (
        await request(app)
          .post(`/api/purchases/${id}/costing/preview`)
          .set('Authorization', auth())
          .send(input())
      ).status,
    ).toBe(404);
  });
  it('restricts a historical revision to its purchase', async () => {
    expect(
      (
        await request(app)
          .get(`/api/purchases/${id}/costing/revisions/${second}`)
          .set('Authorization', auth())
      ).status,
    ).toBe(404);
    expect(db.purchaseCosting.findFirst).toHaveBeenCalledWith({
      where: { id: second, purchaseId: id },
    });
  });
});
