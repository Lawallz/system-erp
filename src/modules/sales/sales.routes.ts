import prisma from '../../config/prisma.js';
import { z } from 'zod';
import { sendPage } from '../../shared/listing.js';
import { Router } from 'express';

import { SalesController } from './sales.controller.js';

import { ensureAuthenticated, verifyPermission } from '../../middlewares/authMiddleware.js';

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

router.get('/lookup', verifyPermission('sales:create'), async (req, res, next) => {
  try {
    const code = z.string().trim().min(1).max(100).parse(req.query.code);
    const products = await prisma.product.findMany({
      where: { isActive: true, OR: [{ sku: code }, { barcode: code }] }, take: 2,
      select: { id: true, name: true, sku: true, barcode: true, price: true, stockQuantity: true, isActive: true },
    });
    if (!products.length) { res.status(404).json({ status: 'error', message: 'Código não encontrado. Busque pelo nome ou confira o cadastro.' }); return; }
    if (products.length > 1) { res.status(409).json({ status: 'error', message: 'Código ambíguo entre SKU e código de barras. Selecione o produto pela busca.' }); return; }
    res.json({ status: 'success', data: products[0] });
  } catch (error) { next(error); }
});

router.get('/catalog', verifyPermission('sales:create'), (req, res, next) => {
  sendPage(req, res, 'saleCatalog').catch(next);
});

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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/',
  verifyPermission('sales:create'),
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
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/',
  verifyPermission('sales:read'),
  salesController.list
);

export default router;