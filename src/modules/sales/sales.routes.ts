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
 *                     totalAmount:
 *                       type: string
 *                       example: "200"
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           saleId:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           unitPrice:
 *                             type: string
 *                             example: "100"
 *                           subtotal:
 *                             type: string
 *                             example: "200"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Dados inválidos, produto inativo ou estoque insuficiente
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Um ou mais produtos não foram encontrados
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
 *                       totalAmount:
 *                         type: string
 *                         example: "200"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             saleId:
 *                               type: string
 *                               format: uuid
 *                             productId:
 *                               type: string
 *                               format: uuid
 *                             quantity:
 *                               type: integer
 *                               example: 2
 *                             unitPrice:
 *                               type: string
 *                               example: "100"
 *                             subtotal:
 *                               type: string
 *                               example: "200"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             product:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: Produto Teste Estoque
 *                                 sku:
 *                                   type: string
 *                                   example: TEST-001
 *       401:
 *         description: Não autenticado
 */
router.get(
  '/',
  salesController.list
);

export default router;