import { Router } from 'express';

import { ReportController } from './report.controller.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

const reportRoutes = Router();

const reportController = new ReportController();

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Relatórios gerenciais do ERP
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Gera o relatório de vendas
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de vendas retornado com sucesso
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
 *                     totalSales:
 *                       type: integer
 *                       example: 6
 *                     totalRevenue:
 *                       type: number
 *                       example: 2000
 *                     averageTicket:
 *                       type: number
 *                       example: 333.33
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           sku:
 *                             type: string
 *                             example: TEST-001
 *                           name:
 *                             type: string
 *                             example: Produto Teste Estoque
 *                           quantity:
 *                             type: integer
 *                             example: 11
 *                           revenue:
 *                             type: number
 *                             example: 1100
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
reportRoutes.get(
  '/sales',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.sales.bind(reportController)
);

/**
 * @swagger
 * /api/reports/stock:
 *   get:
 *     summary: Gera o relatório de estoque
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de estoque retornado com sucesso
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
 *                     totalProducts:
 *                       type: integer
 *                       example: 4
 *                     totalQuantity:
 *                       type: integer
 *                       example: 18
 *                     lowStockCount:
 *                       type: integer
 *                       example: 3
 *                     lowStockProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           sku:
 *                             type: string
 *                             example: TEST-002
 *                           name:
 *                             type: string
 *                             example: Produto Teste ABC B
 *                           stockQuantity:
 *                             type: integer
 *                             example: 0
 *                           minStockAlert:
 *                             type: integer
 *                             example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
reportRoutes.get(
  '/stock',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.stock.bind(reportController)
);

/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Gera o relatório de produtos
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de produtos retornado com sucesso
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
 *                     totalProducts:
 *                       type: integer
 *                       example: 4
 *                     activeProducts:
 *                       type: integer
 *                       example: 4
 *                     inactiveProducts:
 *                       type: integer
 *                       example: 0
 *                     productsWithoutMovement:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           sku:
 *                             type: string
 *                             example: TEST-005
 *                           name:
 *                             type: string
 *                             example: Produto sem movimentação
 *                           description:
 *                             type: string
 *                             nullable: true
 *                             example: Produto ainda sem movimentação
 *                           price:
 *                             type: string
 *                             example: "100"
 *                           costPrice:
 *                             type: string
 *                             example: "50"
 *                           stockQuantity:
 *                             type: integer
 *                             example: 0
 *                           minStockAlert:
 *                             type: integer
 *                             example: 5
 *                           categoryId:
 *                             type: string
 *                             format: uuid
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           category:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: Eletrônicos
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Produtos eletrônicos e acessórios
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                           _count:
 *                             type: object
 *                             properties:
 *                               saleItems:
 *                                 type: integer
 *                                 example: 0
 *                               stockMovements:
 *                                 type: integer
 *                                 example: 0
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
reportRoutes.get(
  '/products',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.products.bind(reportController)
);

/**
 * @swagger
 * /api/reports/abc:
 *   get:
 *     summary: Gera o relatório de curva ABC
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de curva ABC retornado com sucesso
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
 *                     totalRevenue:
 *                       type: number
 *                       example: 2000
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           sku:
 *                             type: string
 *                             example: TEST-001
 *                           name:
 *                             type: string
 *                             example: Produto Teste Estoque
 *                           revenue:
 *                             type: number
 *                             example: 1100
 *                           percentage:
 *                             type: number
 *                             example: 55
 *                           accumulatedPercentage:
 *                             type: number
 *                             example: 55
 *                           classification:
 *                             type: string
 *                             enum:
 *                               - A
 *                               - B
 *                               - C
 *                             example: A
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
reportRoutes.get(
  '/abc',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.abc.bind(reportController)
);

export default reportRoutes;