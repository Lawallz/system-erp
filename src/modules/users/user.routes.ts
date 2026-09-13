import { Router } from 'express';

import { UserController } from './user.controller.js';

import {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
} from './user.schema.js';

import {
  ensureAuthenticated,
  verifyPermission,
} from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

const userRoutes = Router();

const userController = new UserController();

userRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('users:create'),
  validateSchema(createUserSchema),
  userController.create.bind(userController)
);

userRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('users:read'),
  userController.list.bind(userController)
);

userRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:read'),
  userController.findById.bind(userController)
);

userRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateUserSchema),
  userController.update.bind(userController)
);

userRoutes.patch(
  '/:id/password',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updatePasswordSchema),
  userController.updatePassword.bind(userController)
);

userRoutes.patch(
  '/:id/deactivate',
  ensureAuthenticated,
  verifyPermission('users:delete'),
  userController.deactivate.bind(userController)
);

userRoutes.patch(
  '/:id/activate',
  ensureAuthenticated,
  verifyPermission('users:update'),
  userController.activate.bind(userController)
);

export default userRoutes;