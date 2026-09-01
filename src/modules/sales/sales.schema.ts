import { z } from 'zod';

export const createSaleSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid('ID do produto inválido'),
      quantity: z.number().int().positive('A quantidade deve ser maior que zero'),
    })
  ).min(1, 'A venda precisa ter pelo menos um item'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;