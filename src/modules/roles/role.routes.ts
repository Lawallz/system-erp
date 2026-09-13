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

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Gerenciamento de perfis e permissões
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Cria um novo perfil
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
roleRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('users:create'),
  validateSchema(createRoleSchema),
  roleController.create.bind(roleController)
);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lista os perfis
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de perfis retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
roleRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.list.bind(roleController)
);

/**
 * @swagger
 * /api/roles/permissions:
 *   get:
 *     summary: Lista as permissões disponíveis
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
roleRoutes.get(
  '/permissions',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.listPermissions.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Busca um perfil pelo ID
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Perfil encontrado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
roleRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:read'),
  roleController.findById.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Atualiza um perfil
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
roleRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateRoleSchema),
  roleController.update.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   put:
 *     summary: Atualiza as permissões de um perfil
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do perfil
 *     responses:
 *       200:
 *         description: Permissões atualizadas com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
roleRoutes.put(
  '/:id/permissions',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateRolePermissionsSchema),
  roleController.updatePermissions.bind(roleController)
);

export default roleRoutes;