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
 *                 example: a924cbf7-9061-433b-94a6-3c58927a7f00
 *           example:
 *             supplierId: a924cbf7-9061-433b-94a6-3c58927a7f00
 *     responses:
 *       201:
 *         description: Compra registrada com sucesso
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     supplierId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     totalAmount:
 *                       type: string
 *                       example: "0"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Fornecedor Teste LTDA
 *                         document:
 *                           type: string
 *                           nullable: true
 *                           example: "12345678000199"
 *                         email:
 *                           type: string
 *                           format: email
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *           format: uuid
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
 *                 example: 85244462-52b1-40be-b32e-6eacd758b52a
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               unitCost:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 50
 *           example:
 *             productId: 85244462-52b1-40be-b32e-6eacd758b52a
 *             quantity: 10
 *             unitCost: 50
 *     responses:
 *       201:
 *         description: Item adicionado à compra com sucesso
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
 *                     item:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         purchaseId:
 *                           type: string
 *                           format: uuid
 *                         productId:
 *                           type: string
 *                           format: uuid
 *                         quantity:
 *                           type: integer
 *                           example: 10
 *                         unitCost:
 *                           type: string
 *                           example: "50"
 *                         subtotal:
 *                           type: string
 *                           example: "500"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     purchase:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         supplierId:
 *                           type: string
 *                           format: uuid
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           example: PENDING
 *                         totalAmount:
 *                           type: string
 *                           example: "500"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
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
 *                       supplierId:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         example: RECEIVED
 *                       totalAmount:
 *                         type: string
 *                         example: "500"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       supplier:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                             example: Fornecedor Teste LTDA
 *                           document:
 *                             type: string
 *                             nullable: true
 *                             example: "12345678000199"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                             example: Administrador
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: admin@minierp.com
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             purchaseId:
 *                               type: string
 *                               format: uuid
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                             quantity:
 *                               type: integer
 *                               example: 10
 *                             unitCost:
 *                               type: string
 *                               example: "50"
 *                             subtotal:
 *                               type: string
 *                               example: "500"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             product:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 sku:
 *                                   type: string
 *                                   example: TEST-001
 *                                 name:
 *                                   type: string
 *                                   example: Produto Teste Estoque
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
 *           format: uuid
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Compra encontrada com sucesso
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     supplierId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: RECEIVED
 *                     totalAmount:
 *                       type: string
 *                       example: "500"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         document:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           format: email
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         isActive:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           purchaseId:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                           unitCost:
 *                             type: string
 *                           subtotal:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               sku:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                               price:
 *                                 type: string
 *                               costPrice:
 *                                 type: string
 *                               stockQuantity:
 *                                 type: integer
 *                               minStockAlert:
 *                                 type: integer
 *                               categoryId:
 *                                 type: string
 *                                 format: uuid
 *                               isActive:
 *                                 type: boolean
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *           format: uuid
 *         description: ID da compra
 *     responses:
 *       200:
 *         description: Compra recebida com sucesso
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     supplierId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: RECEIVED
 *                     totalAmount:
 *                       type: string
 *                       example: "500"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Fornecedor Teste LTDA
 *                         document:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           format: email
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           purchaseId:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                           unitCost:
 *                             type: string
 *                           subtotal:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
purchaseRoutes.patch(
  '/:id/receive',
  ensureAuthenticated,
  verifyPermission('purchases:receive'),
  purchaseController.receive.bind(purchaseController)
);

export default purchaseRoutes;