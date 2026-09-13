import { Router } from 'express';

import { SalesController } from './sales.controller.js';

import { ensureAuthenticated } from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

import { createSaleSchema } from './sales.schema.js';

const router = Router();

const salesController = new SalesController();

/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Gerenciamento de vendas
 */

router.use(ensureAuthenticated);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Registra uma nova venda
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Venda registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post(
  '/',
  validateSchema(createSaleSchema),
  salesController.create
);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Lista as vendas
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendas retornada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get(
  '/',
  salesController.list
);

export default router;