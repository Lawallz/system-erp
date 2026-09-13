import { Router } from 'express';

import { StockController } from './stock.controller.js';

import { createStockMovementSchema } from './stock.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const stockRoutes = Router();

const stockController = new StockController();

/**
 * @swagger
 * tags:
 *   - name: Stock
 *     description: Gerenciamento de estoque
 */

/**
 * @swagger
 * /api/stock/movements:
 *   get:
 *     summary: Lista as movimentações de estoque
 *     tags:
 *       - Stock
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Movimentações de estoque retornadas com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
stockRoutes.get(
  '/movements',
  ensureAuthenticated,
  verifyPermission('stock:read'),
  stockController.listMovements.bind(stockController)
);

/**
 * @swagger
 * /api/stock/low-stock:
 *   get:
 *     summary: Lista produtos com estoque baixo
 *     tags:
 *       - Stock
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos com estoque baixo retornados com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
stockRoutes.get(
  '/low-stock',
  ensureAuthenticated,
  verifyPermission('stock:read'),
  stockController.listLowStock.bind(stockController)
);

/**
 * @swagger
 * /api/stock/movements:
 *   post:
 *     summary: Registra uma movimentação de estoque
 *     tags:
 *       - Stock
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do produto movimentado
 *                 example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *               type:
 *                 type: string
 *                 description: Tipo da movimentação de estoque
 *                 enum:
 *                   - PURCHASE
 *                   - SALE
 *                   - ADJUSTMENT_IN
 *                   - ADJUSTMENT_OUT
 *                   - RETURN
 *                   - LOSS
 *                 example: ADJUSTMENT_IN
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantidade movimentada
 *                 example: 10
 *               reason:
 *                 type: string
 *                 description: Motivo ou observação da movimentação
 *                 example: Ajuste de estoque após conferência
 *           example:
 *             productId: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *             type: ADJUSTMENT_IN
 *             quantity: 10
 *             reason: Ajuste de estoque após conferência
 *     responses:
 *       201:
 *         description: Movimentação de estoque registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
stockRoutes.post(
  '/movements',
  ensureAuthenticated,
  verifyPermission('stock:create'),
  validateSchema(createStockMovementSchema),
  stockController.registerMovement.bind(stockController)
);

export default stockRoutes;