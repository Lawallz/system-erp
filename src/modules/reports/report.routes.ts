import { Router } from 'express';

import { ReportController } from './report.controller.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

const reportRoutes = Router();

const reportController = new ReportController();

reportRoutes.get(
  '/sales',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.sales.bind(reportController)
);

reportRoutes.get(
  '/stock',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.stock.bind(reportController)
);

reportRoutes.get(
  '/products',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.products.bind(reportController)
);

reportRoutes.get(
  '/abc',
  ensureAuthenticated,
  verifyPermission('reports:read'),
  reportController.abc.bind(reportController)
);

export default reportRoutes;