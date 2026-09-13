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
 *         description: Compra não encontrada
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
 *         description: Não foi possível receber a compra
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