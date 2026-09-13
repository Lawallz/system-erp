import { Router } from 'express';

import { RoleController } from './role.controller.js';

import {
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema,
} from './role.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const roleRoutes = Router();

const roleController = new RoleController();

roleRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('users:create'),
  validateSchema(createRoleSchema),
  roleController.create.bind(roleController)
);

roleRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.list.bind(roleController)
);

roleRoutes.get(
  '/permissions',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.listPermissions.bind(roleController)
);

roleRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.findById.bind(roleController)
);

roleRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateRoleSchema),
  roleController.update.bind(roleController)
);

roleRoutes.put(
  '/:id/permissions',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateRolePermissionsSchema),
  roleController.updatePermissions.bind(roleController)
);

export default roleRoutes;