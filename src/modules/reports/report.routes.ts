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
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
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
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
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
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
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
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
reportRoutes.get(
  '/abc',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.abc.bind(reportController)
);

export default reportRoutes;