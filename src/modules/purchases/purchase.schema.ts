import { z } from 'zod';

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('ID do fornecedor inválido'),
});

export const createPurchaseItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z
    .number()
    .int('A quantidade deve ser um número inteiro')
    .positive('A quantidade deve ser maior que zero'),
  unitCost: z
    .number()
    .positive('O custo unitário deve ser maior que zero'),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type CreatePurchaseItemInput = z.infer<typeof createPurchaseItemSchema>;