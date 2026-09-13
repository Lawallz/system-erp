import { Router } from 'express';

import { StockController } from './stock.controller.js';
import { createStockMovementSchema } from './stock.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const stockRoutes = Router();

const stockController = new StockController();

stockRoutes.get(
  '/movements',
  ensureAuthenticated,
  verifyPermission('stock:read'),
  stockController.listMovements.bind(stockController)
);

stockRoutes.get(
  '/low-stock',
  ensureAuthenticated,
  verifyPermission('stock:read'),
  stockController.listLowStock.bind(stockController)
);

stockRoutes.post(
  '/movements',
  ensureAuthenticated,
  verifyPermission('stock:create'),
  validateSchema(createStockMovementSchema),
  stockController.registerMovement.bind(stockController)
);

export default stockRoutes;