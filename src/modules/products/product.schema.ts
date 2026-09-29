import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'O nome da categoria é obrigatório'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  sku: z.string().trim().min(2, 'O SKU é obrigatório'),
  name: z.string().trim().min(2, 'O nome do produto é obrigatório'),
  description: z.string().optional(),
  barcode: z.string().trim().max(80, 'Código muito longo').nullable().optional().transform(value => value === '' ? null : value),
  price: z.number().finite().positive('O preço deve ser maior que zero'),
  costPrice: z
    .number()
    .finite()
    .positive('O preço de custo deve ser maior que zero'),
  minStockAlert: z.number().int().nonnegative().default(0),
  categoryId: z.string().uuid('ID de categoria inválido'),
});

// Never allow stockQuantity or isActive through the metadata endpoint.
export const updateProductSchema = createProductSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Informe pelo menos um campo para atualizar',
  );
export const productIdSchema = z.string().uuid('ID do produto inválido');
export const productListSchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).default('active'),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
