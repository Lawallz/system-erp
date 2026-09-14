import { Router } from 'express';

import { DashboardController } from './dashboard.controller.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

const dashboardRoutes = Router();

const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Indicadores e resumo geral do ERP
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Retorna o resumo geral do dashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
  *     responses:
 *       200:
 *         description: Resumo do dashboard retornado com sucesso
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: integer
 *                           example: 4
 *                         lowStockCount:
 *                           type: integer
 *                           example: 3
 *                         totalSales:
 *                           type: integer
 *                           example: 6
 *                         totalRevenue:
 *                           type: number
 *                           example: 2000
 *                         averageTicket:
 *                           type: number
 *                           example: 333.33
 *                         pendingPurchases:
 *                           type: integer
 *                           example: 0
 *                     recentSales:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           totalAmount:
 *                             type: string
 *                             example: "200"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: Administrador
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 quantity:
 *                                   type: integer
 *                                   example: 2
 *                                 unitPrice:
 *                                   type: string
 *                                   example: "100"
 *                                 subtotal:
 *                                   type: string
 *                                   example: "200"
 *                                 product:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                       format: uuid
 *                                     sku:
 *                                       type: string
 *                                       example: TEST-001
 *                                     name:
 *                                       type: string
 *                                       example: Produto Teste Estoque
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
 *                     pendingPurchases:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
dashboardRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  dashboardController.getSummary.bind(dashboardController)
);

export default dashboardRoutes;