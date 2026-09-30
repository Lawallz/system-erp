import { z } from 'zod';
import { Prisma } from '@prisma/client';
// Decimal strings avoid binary floating point and reject empty/locale-ambiguous values.
const decimal = (places: number, max: string, positive = false) =>
  z
    .string()
    .regex(
      new RegExp(`^\\d{1,12}(\\.\\d{1,${places}})?$`),
      `Use número com ponto e até ${places} casas decimais`,
    )
    .refine((value) => {
      try {
        const amount = new Prisma.Decimal(value);
        return amount.lte(max) && (positive ? amount.gt(0) : amount.gte(0));
      } catch {
        return false;
      }
    }, 'Valor fora do limite');
const money = decimal(2, '9999999999.99');
export const costingSchema = z
  .object({
    stage: z.enum(['ESTIMATE', 'ACTUAL']),
    operation: z.enum([
      'DOMESTIC',
      'COMMERCIAL_IMPORT',
      'INTERNATIONAL_PARCEL',
    ]),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/, 'Informe a moeda com três letras, por exemplo USD'),
    exchangeRate: decimal(6, '100000', true),
    reference: z.string().trim().max(200).default(''),
    notes: z.string().trim().max(2000).default(''),
    purchaseFingerprint: z.string().length(64),
    expectedRevision: z.number().int().min(0).max(1000000),
    items: z
      .array(
        z
          .object({
            purchaseItemId: z.string().uuid(),
            unitCost: decimal(6, '9999999999.99', true),
          })
          .strict(),
      )
      .min(1)
      .max(200),
    charges: z
      .array(
        z
          .object({
            label: z.string().trim().min(2).max(100),
            kind: z.enum(['TAX', 'EXPENSE']),
            mode: z.enum(['FIXED', 'PERCENT']),
            amount: money,
            rate: decimal(6, '100'),
            base: money,
            grossUp: z.boolean(),
          })
          .strict()
          .superRefine((charge, ctx) => {
            if (
              charge.mode === 'PERCENT' &&
              charge.grossUp &&
              Number(charge.rate) >= 100
            )
              ctx.addIssue({
                code: 'custom',
                message: 'Cálculo por dentro exige percentual menor que 100%',
              });
          }),
      )
      .max(60),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.currency === 'BRL' && Number(input.exchangeRate) !== 1)
      ctx.addIssue({
        code: 'custom',
        message: 'Para BRL, o câmbio deve ser 1',
      });
    if (input.operation === 'DOMESTIC' && input.currency !== 'BRL')
      ctx.addIssue({
        code: 'custom',
        message: 'Operação nacional deve usar BRL',
      });
    if (input.stage === 'ACTUAL' && !input.reference)
      ctx.addIssue({
        code: 'custom',
        message: 'Informe a referência dos documentos para custos realizados',
      });
    if (
      new Set(input.items.map((item) => item.purchaseItemId)).size !==
      input.items.length
    )
      ctx.addIssue({ code: 'custom', message: 'Item duplicado' });
  });
export type CostingInput = z.infer<typeof costingSchema>;
