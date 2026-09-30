import { Router, type Request } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';
import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';
import { AppError } from '../../errors/appError.js';
import { costingSchema } from './costing.schema.js';
import { calculateCosting, fingerprint } from './costing.calculator.js';
const router = Router({ mergeParams: true });
const uuid = z.string().uuid();
const purchaseIdFrom = (req: Request) => uuid.parse(req.params.purchaseId);
const include = {
  items: {
    include: { product: { select: { name: true, sku: true, price: true } } },
    orderBy: { id: 'asc' as const },
  },
  supplier: { select: { name: true } },
};
router.use(ensureAuthenticated, verifyPermission('purchases:read'));
router.get('/', async (req, res, next) => {
  try {
    const purchaseId = purchaseIdFrom(req);
    const result = await prisma.$transaction(
      async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          include,
        });
        if (!purchase) throw new AppError('Compra não encontrada', 404);
        const [estimate, actual, history] = await Promise.all([
          tx.purchaseCosting.findFirst({
            where: { purchaseId, stage: 'ESTIMATE' },
            orderBy: { revision: 'desc' },
          }),
          tx.purchaseCosting.findFirst({
            where: { purchaseId, stage: 'ACTUAL' },
            orderBy: { revision: 'desc' },
          }),
          tx.purchaseCosting.findMany({
            where: { purchaseId },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 20,
            select: {
              id: true,
              stage: true,
              revision: true,
              reference: true,
              createdAt: true,
            },
          }),
        ]);
        return {
          purchase,
          purchaseFingerprint: fingerprint(purchase.items),
          estimate,
          actual,
          history,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});
router.get('/revisions/:id', async (req, res, next) => {
  try {
    const record = await prisma.purchaseCosting.findFirst({
      where: { id: uuid.parse(req.params.id), purchaseId: purchaseIdFrom(req) },
    });
    if (!record) throw new AppError('Revisão não encontrada', 404);
    res.json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
});
router.post('/preview', async (req, res, next) => {
  try {
    const input = costingSchema.parse(req.body);
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseIdFrom(req) },
      include,
    });
    if (!purchase) throw new AppError('Compra não encontrada', 404);
    res.json({
      status: 'success',
      data: calculateCosting(input, purchase.items),
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  '/',
  verifyPermission('purchases:create'),
  async (req, res, next) => {
    try {
      const purchaseId = purchaseIdFrom(req);
      const input = costingSchema.parse(req.body);
      const result = await prisma.$transaction(
        async (tx) => {
          const purchase = await tx.purchase.findUnique({
            where: { id: purchaseId },
            include,
          });
          if (!purchase) throw new AppError('Compra não encontrada', 404);
          const latest = await tx.purchaseCosting.findFirst({
            where: { purchaseId, stage: input.stage },
            orderBy: { revision: 'desc' },
          });
          if ((latest?.revision || 0) !== input.expectedRevision)
            throw new AppError(
              'Outra revisão foi salva. Recarregue para evitar sobrescrever alterações.',
              409,
            );
          const output = calculateCosting(input, purchase.items);
          const record = await tx.purchaseCosting.create({
            data: {
              purchaseId,
              stage: input.stage,
              revision: input.expectedRevision + 1,
              reference: input.reference,
              input: input as Prisma.InputJsonValue,
              output: output as Prisma.InputJsonValue,
              createdById: req.user!.id,
            },
          });
          await tx.auditLog.create({
            data: {
              userId: req.user!.id,
              action: 'PURCHASE_COSTING_SAVED',
              resource: 'purchase',
              resourceId: purchaseId,
              details: JSON.stringify({
                costingId: record.id,
                stage: input.stage,
                revision: record.revision,
                totalBRL: output.totalBRL,
              }),
              ipAddress: req.ip,
            },
          });
          return record;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2034'].includes(error.code)
      ) {
        next(
          new AppError(
            'Conflito entre revisões. Recarregue e confira os custos antes de salvar novamente.',
            409,
          ),
        );
        return;
      }
      next(error);
    }
  },
);
export default router;
