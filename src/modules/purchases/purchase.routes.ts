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

purchaseRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('purchases:create'),
  validateSchema(createPurchaseSchema),
  purchaseController.create.bind(purchaseController)
);

purchaseRoutes.post(
  '/:id/items',
  ensureAuthenticated,
  verifyPermission('purchases:create'),
  validateSchema(createPurchaseItemSchema),
  purchaseController.addItem.bind(purchaseController)
);

purchaseRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('purchases:read'),
  purchaseController.list.bind(purchaseController)
);

purchaseRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('purchases:read'),
  purchaseController.findById.bind(purchaseController)
);

purchaseRoutes.patch(
  '/:id/receive',
  ensureAuthenticated,
  verifyPermission('purchases:receive'),
  purchaseController.receive.bind(purchaseController)
);

export default purchaseRoutes;