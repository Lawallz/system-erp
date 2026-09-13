import { Router } from 'express';

import { DashboardController } from './dashboard.controller.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

const dashboardRoutes = Router();

const dashboardController = new DashboardController();

dashboardRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  dashboardController.getSummary.bind(dashboardController)
);

export default dashboardRoutes;