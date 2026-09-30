import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AppError } from '../../errors/appError.js';
import type { CostingInput } from './costing.schema.js';
const D = Prisma.Decimal.clone({ precision: 40 });
const round = (value: Prisma.Decimal) =>
  value.toDecimalPlaces(2, D.ROUND_HALF_UP);
export type SourceItem = {
  id: string;
  productId: string;
  quantity: number;
  unitCost: Prisma.Decimal | string;
  subtotal: Prisma.Decimal | string;
  product: { name: string; sku: string; price: Prisma.Decimal | string };
};
export function fingerprint(items: SourceItem[]) {
  return createHash('sha256')
    .update(
      JSON.stringify(
        [...items]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((item) => [
            item.id,
            item.productId,
            item.quantity,
            String(item.unitCost),
            String(item.subtotal),
          ]),
      ),
    )
    .digest('hex');
}
export function calculateCosting(input: CostingInput, source: SourceItem[]) {
  if (input.purchaseFingerprint !== fingerprint(source))
    throw new AppError(
      'Os itens da compra mudaram. Recarregue a página antes de calcular.',
      409,
    );
  if (
    source.length !== input.items.length ||
    source.some(
      (item) => !input.items.some((row) => row.purchaseItemId === item.id),
    )
  )
    throw new AppError('Informe exatamente os itens atuais da compra', 400);
  if (
    source.some(
      (item) => !Number.isSafeInteger(item.quantity) || item.quantity <= 0,
    )
  )
    throw new AppError('Quantidade inválida na compra', 400);
  const exchange = new D(input.exchangeRate);
  const items = [...source]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((item) => {
      const entered = input.items.find(
        (row) => row.purchaseItemId === item.id,
      )!;
      const goods = round(
        new D(entered.unitCost).mul(item.quantity).mul(exchange),
      );
      return { source: item, entered, goods };
    });
  const goodsTotal = items.reduce((sum, item) => sum.add(item.goods), new D(0));
  if (goodsTotal.gt('999999999999.99'))
    throw new AppError('Valor total dos produtos excede o limite', 400);
  if (goodsTotal.lte(0))
    throw new AppError(
      'O valor convertido dos produtos deve ser maior que zero',
      400,
    );
  const charges = input.charges.map((charge) => {
    const fraction = new D(charge.rate).div(100);
    const value =
      charge.mode === 'FIXED'
        ? new D(charge.amount)
        : new D(charge.base)
            .mul(fraction)
            .div(charge.grossUp ? new D(1).sub(fraction) : 1);
    const amountBRL = round(value);
    if (amountBRL.gt('999999999999.99'))
      throw new AppError('Encargo calculado excede o limite', 400);
    return { ...charge, amountBRL: amountBRL.toFixed(2) };
  });
  const taxTotal = charges
    .filter((c) => c.kind === 'TAX')
    .reduce((sum, c) => sum.add(c.amountBRL), new D(0));
  const expenseTotal = charges
    .filter((c) => c.kind === 'EXPENSE')
    .reduce((sum, c) => sum.add(c.amountBRL), new D(0));
  const extra = taxTotal.add(expenseTotal);
  if (goodsTotal.add(extra).gt('999999999999.99'))
    throw new AppError(
      'Custo total excede o limite de R$ 999.999.999.999,99',
      400,
    );
  const cents = extra.mul(100);
  // Largest remainder allocation: every cent is assigned exactly once, ties by stable item ID.
  const allocations = items.map((item, index) => {
    const exact = cents.mul(item.goods).div(goodsTotal);
    const floor = exact.floor();
    return { index, cents: floor, remainder: exact.sub(floor) };
  });
  const remainder = cents
    .sub(allocations.reduce((sum, item) => sum.add(item.cents), new D(0)))
    .toNumber();
  const ranked = [...allocations].sort(
    (a, b) => b.remainder.comparedTo(a.remainder) || a.index - b.index,
  );
  for (let i = 0; i < remainder; i++) ranked[i].cents = ranked[i].cents.add(1);
  const outputItems = items.map((item, index) => {
    const allocated = allocations[index].cents.div(100);
    const landed = item.goods.add(allocated);
    const unit = landed.div(item.source.quantity);
    const price = new D(item.source.product.price);
    return {
      purchaseItemId: item.source.id,
      productId: item.source.productId,
      name: item.source.product.name,
      sku: item.source.product.sku,
      quantity: item.source.quantity,
      originalUnitCost: item.entered.unitCost,
      goodsBRL: item.goods.toFixed(2),
      allocatedBRL: allocated.toFixed(2),
      totalBRL: landed.toFixed(2),
      unitCostBRL: unit.toFixed(6),
      salePriceBRL: price.toFixed(2),
      grossMarginPercent: price.gt(0)
        ? price.sub(unit).div(price).mul(100).toFixed(2)
        : null,
    };
  });
  return {
    calculationVersion: 1,
    allocation: 'PROPORTIONAL_GOODS_LARGEST_REMAINDER',
    currency: input.currency,
    exchangeRate: exchange.toFixed(6),
    goodsBRL: goodsTotal.toFixed(2),
    taxesBRL: taxTotal.toFixed(2),
    expensesBRL: expenseTotal.toFixed(2),
    totalBRL: goodsTotal.add(extra).toFixed(2),
    charges,
    items: outputItems,
  };
}
