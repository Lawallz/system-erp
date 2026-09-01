import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria é obrigatório'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  sku: z.string().min(2, 'O SKU é obrigatório'),
  name: z.string().min(2, 'O nome do produto é obrigatório'),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero'),
  costPrice: z.number().positive('O preço de custo deve ser maior que zero'),
  minStockAlert: z.number().int().nonnegative().default(0),
  categoryId: z.string().uuid('ID de categoria inválido'),
});

export const updateProductSchema = createProductSchema.partial();