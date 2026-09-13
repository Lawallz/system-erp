import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  email: z
    .string()
    .trim()
    .email('E-mail inválido'),

  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),

  roleId: z
    .string()
    .uuid('ID da função inválido'),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .optional(),

  email: z
    .string()
    .trim()
    .email('E-mail inválido')
    .optional(),

  roleId: z
    .string()
    .uuid('ID da função inválido')
    .optional(),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;