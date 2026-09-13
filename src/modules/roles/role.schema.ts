import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  description: z
    .string()
    .trim()
    .min(3, 'A descrição deve ter pelo menos 3 caracteres')
    .optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const updateRolePermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().uuid('ID de permissão inválido'))
    .min(1, 'Informe pelo menos uma permissão'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>;