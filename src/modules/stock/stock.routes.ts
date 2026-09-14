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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum:
 *                           - PURCHASE
 *                           - SALE
 *                           - ADJUSTMENT_IN
 *                           - ADJUSTMENT_OUT
 *                           - RETURN
 *                           - LOSS
 *                       quantity:
 *                         type: integer
 *                         example: 10
 *                       previousStock:
 *                         type: integer
 *                         example: 8
 *                       newStock:
 *                         type: integer
 *                         example: 18
 *                       reason:
 *                         type: string
 *                         nullable: true
 *                         example: Ajuste de estoque após conferência
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       product:
 *                         type: object
 *                         properties:
 *                           sku:
 *                             type: string
 *                             example: TEST-001
 *                           name:
 *                             type: string
 *                             example: Produto Teste Estoque
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Administrador
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: admin@minierp.com
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       sku:
 *                         type: string
 *                         example: TEST-002
 *                       name:
 *                         type: string
 *                         example: Produto Teste ABC B
 *                       stockQuantity:
 *                         type: integer
 *                         example: 0
 *                       minStockAlert:
 *                         type: integer
 *                         example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
 *                 example: 85244462-52b1-40be-b32e-6eacd758b52a
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
 *             productId: 85244462-52b1-40be-b32e-6eacd758b52a
 *             type: ADJUSTMENT_IN
 *             quantity: 10
 *             reason: Ajuste de estoque após conferência
 *     responses:
 *       201:
 *         description: Movimentação de estoque registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedProduct:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         sku:
 *                           type: string
 *                           example: TEST-001
 *                         name:
 *                           type: string
 *                           example: Produto Teste Estoque
 *                         description:
 *                           type: string
 *                           nullable: true
 *                         price:
 *                           type: string
 *                           example: "100"
 *                         costPrice:
 *                           type: string
 *                           example: "50"
 *                         stockQuantity:
 *                           type: integer
 *                           example: 18
 *                         minStockAlert:
 *                           type: integer
 *                           example: 2
 *                         categoryId:
 *                           type: string
 *                           format: uuid
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     movement:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         productId:
 *                           type: string
 *                           format: uuid
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                         type:
 *                           type: string
 *                           enum:
 *                             - PURCHASE
 *                             - SALE
 *                             - ADJUSTMENT_IN
 *                             - ADJUSTMENT_OUT
 *                             - RETURN
 *                             - LOSS
 *                         quantity:
 *                           type: integer
 *                           example: 10
 *                         previousStock:
 *                           type: integer
 *                           example: 8
 *                         newStock:
 *                           type: integer
 *                           example: 18
 *                         reason:
 *                           type: string
 *                           nullable: true
 *                           example: Ajuste de estoque após conferência
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
stockRoutes.post(
  '/movements',
  ensureAuthenticated,
  verifyPermission('stock:create'),
  validateSchema(createStockMovementSchema),
  stockController.registerMovement.bind(stockController)
);

export default stockRoutes;