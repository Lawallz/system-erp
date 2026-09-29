import { z } from 'zod';
import type { Request } from 'express';

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use datas no formato AAAA-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, 'Data inválida');
export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(100).default(''),
    from: calendarDate.optional(),
    to: calendarDate.optional(),
    status: z.enum(['active', 'inactive', 'all']).default('active'),
    categoryId: z.string().uuid().optional(),
    stock: z.enum(['all', 'low', 'out']).default('all'),
  })
  .refine(
    (query) => !query.from || !query.to || query.from <= query.to,
    'A data inicial deve ser anterior ou igual à final',
  );
export type ListQuery = z.infer<typeof listQuerySchema>;
export const isPaged = (req: Request) =>
  req.query.page !== undefined || req.query.limit !== undefined;
export function dateRange(query: ListQuery) {
  // Calendar dates use the ERP's explicit UTC-03 business-day boundary.
  return {
    ...(query.from ? { gte: new Date(`${query.from}T00:00:00-03:00`) } : {}),
    ...(query.to
      ? {
          lt: new Date(
            new Date(`${query.to}T00:00:00-03:00`).getTime() + 86400000,
          ),
        }
      : {}),
  };
}
export function pageResult<T>(items: T[], total: number, query: ListQuery) {
  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
