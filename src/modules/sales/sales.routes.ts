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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 description: Lista de itens da venda. O mesmo produto não pode aparecer mais de uma vez.
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       description: ID do produto vendido
 *                       example: 85244462-52b1-40be-b32e-6eacd758b52a
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantidade vendida
 *                       example: 2
 *           example:
 *             items:
 *               - productId: 85244462-52b1-40be-b32e-6eacd758b52a
 *                 quantity: 2
 *     responses:
 *       201:
 *         description: Venda registrada com sucesso
 *       400:
 *         description: Dados inválidos ou regra de negócio não atendida
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