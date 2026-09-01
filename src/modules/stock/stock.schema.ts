import { z } from 'zod';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN', 'LOSS'], {
    errorMap: () => ({ message: 'Tipo de movimentação inválido' }),
  }),
  quantity: z.number().int().positive('A quantidade deve ser um número inteiro maior que zero'),
  reason: z.string().optional(),
});