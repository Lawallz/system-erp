import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  document: z
    .string()
    .trim()
    .min(5, 'O documento deve ter pelo menos 5 caracteres')
    .optional(),

  email: z
    .string()
    .trim()
    .email('E-mail inválido')
    .optional(),

  phone: z
    .string()
    .trim()
    .min(8, 'O telefone deve ter pelo menos 8 caracteres')
    .optional(),

  address: z
    .string()
    .trim()
    .min(3, 'O endereço deve ter pelo menos 3 caracteres')
    .optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;