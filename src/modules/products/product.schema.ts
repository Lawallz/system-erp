import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  sku: z.string().trim().min(2, "O SKU é obrigatório"),
  name: z.string().trim().min(2, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().finite().positive("O preço deve ser maior que zero"),
  costPrice: z
    .number()
    .finite()
    .positive("O preço de custo deve ser maior que zero"),
  minStockAlert: z.number().int().nonnegative().default(0),
  categoryId: z.string().uuid("ID de categoria inválido"),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.string().uuid("ID de produto inválido");
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().trim().max(120).optional(),
  categoryId: z.string().uuid().optional(),
  sku: z.string().trim().max(120).optional(),
});
