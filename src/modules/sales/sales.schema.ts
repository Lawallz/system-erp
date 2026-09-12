import { z } from 'zod';

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('ID do produto inválido'),

        quantity: z
          .number()
          .int('A quantidade deve ser um número inteiro')
          .positive('A quantidade deve ser maior que zero'),
      })
    )
    .min(1, 'A venda precisa ter pelo menos um item')
    .refine(
      (items) => {
        const productIds = items.map((item) => item.productId);

        return new Set(productIds).size === productIds.length;
      },
      {
        message: 'Não é permitido adicionar o mesmo produto mais de uma vez na venda',
      }
    ),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;