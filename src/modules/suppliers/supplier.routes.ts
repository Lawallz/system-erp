import { Router } from 'express';

import { SupplierController } from './supplier.controller.js';

import {
  createSupplierSchema,
  updateSupplierSchema,
} from './supplier.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const supplierRoutes = Router();

const supplierController = new SupplierController();

supplierRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('suppliers:create'),
  validateSchema(createSupplierSchema),
  supplierController.create.bind(supplierController)
);

supplierRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('suppliers:read'),
  supplierController.list.bind(supplierController)
);

supplierRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('suppliers:read'),
  supplierController.findById.bind(supplierController)
);

supplierRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  validateSchema(updateSupplierSchema),
  supplierController.update.bind(supplierController)
);

supplierRoutes.patch(
  '/:id/activate',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  supplierController.activate.bind(supplierController)
);

supplierRoutes.patch(
  '/:id/deactivate',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  supplierController.deactivate.bind(supplierController)
);

export default supplierRoutes;