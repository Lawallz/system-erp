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