import { Router } from 'express';

import { PurchaseController } from './purchase.controller.js';

import {
  createPurchaseSchema,
  createPurchaseItemSchema,
} from './purchase.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const purchaseRoutes = Router();

const purchaseController = new PurchaseController();

/**
 * @swagger
 * tags:
 *   - name: Purchases
 *     description: Gerenciamento de compras
 */

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Registra uma nova compra
 *     tags:
 *       - Purchases
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do fornecedor da compra
 *                 example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *           example:
 *             supplierId: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *     responses:
 *       201:
 *         description: Compra registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
purchaseRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('purchases:create'),
  validateSchema(createPurchaseSchema),
  purchaseController.create.bind(purchaseController)
);

/**
 * @swagger
 * /api/purchases/{id}/items:
 *   post:
 *     summary: Adiciona um item a uma compra
 *     tags:
 *       - Purchases
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - unitCost
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do produto
 *                 example: 85244462-52b1-40be-b32e-6eacd758b52a
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantidade comprada
 *                 example: 10
 *               unitCost:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 description: Custo unitário do produto
 *                 example: 50
 *           example:
 *             productId: 85244462-52b1-40be-b32e-6eacd758b52a
 *             quantity: 10
 *             unitCost: 50
 *     responses:
 *       201:
 *         description: Item adicionado à compra com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Compra ou produto não encontrado
 */
purchaseRoutes.post(
  '/:id/items',
  ensureAuthenticated,
  verifyPermission('purchases:create'),
  validateSchema(createPurchaseItemSchema),
  purchaseController.addItem.bind(purchaseController)
);

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Lista as compras
 *     tags:
 *       - Purchases
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
purchaseRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('purchases:read'),
  purchaseController.list.bind(purchaseController)
);

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Busca uma compra pelo ID
 *     tags:
 *       - Purchases
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Compra encontrada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Compra não encontrada
 */
purchaseRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('purchases:read'),
  purchaseController.findById.bind(purchaseController)
);

/**
 * @swagger
 * /api/purchases/{id}/receive:
 *   patch:
 *     summary: Confirma o recebimento de uma compra
 *     tags:
 *       - Purchases
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Compra recebida com sucesso
 *       400:
 *         description: Compra não pode ser recebida
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Compra não encontrada
 */
purchaseRoutes.patch(
  '/:id/receive',
  ensureAuthenticated,
  verifyPermission('purchases:receive'),
  purchaseController.receive.bind(purchaseController)
);

export default purchaseRoutes;