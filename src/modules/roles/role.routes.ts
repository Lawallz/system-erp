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
 *     description: Gerenciamento de funções e permissões
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Cadastra uma nova função
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome da função
 *                 example: Supervisor
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 description: Descrição da função
 *                 example: Responsável pela supervisão operacional
 *           example:
 *             name: Supervisor
 *             description: Responsável pela supervisão operacional
 *     responses:
 *       201:
 *         description: Função cadastrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: Supervisor
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: Responsável pela supervisão operacional
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       409:
 *         description: Já existe uma função com este nome
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
 *     summary: Lista as funções
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de funções retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Administrador
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       _count:
 *                         type: object
 *                         properties:
 *                           users:
 *                             type: integer
 *                             example: 2
 *                           rolePermissions:
 *                             type: integer
 *                             example: 10
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: users:read
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: Permite visualizar usuários
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
 *     summary: Busca uma função pelo ID
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
 *           format: uuid
 *         description: ID da função
 *     responses:
 *       200:
 *         description: Função encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: Administrador
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     rolePermissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           roleId:
 *                             type: string
 *                             format: uuid
 *                           permissionId:
 *                             type: string
 *                             format: uuid
 *                           permission:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: users:read
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                     _count:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: integer
 *                           example: 2
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Função não encontrada
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
 *     summary: Atualiza uma função
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
 *           format: uuid
 *         description: ID da função
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome da função
 *                 example: Supervisor Operacional
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 description: Descrição da função
 *                 example: Responsável pela supervisão das operações
 *           example:
 *             name: Supervisor Operacional
 *             description: Responsável pela supervisão das operações
 *     responses:
 *       200:
 *         description: Função atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: Supervisor Operacional
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Função não encontrada
 *       409:
 *         description: Já existe uma função com este nome
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
 *     summary: Atualiza as permissões de uma função
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
 *           format: uuid
 *         description: ID da função
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 minItems: 1
 *                 description: IDs das permissões atribuídas à função
 *                 items:
 *                   type: string
 *                   format: uuid
 *           example:
 *             permissionIds:
 *               - 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *     responses:
 *       200:
 *         description: Permissões atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: Supervisor Operacional
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     rolePermissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           roleId:
 *                             type: string
 *                             format: uuid
 *                           permissionId:
 *                             type: string
 *                             format: uuid
 *                           permission:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: users:read
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Função ou uma ou mais permissões não encontradas
 */
roleRoutes.put(
  '/:id/permissions',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateRolePermissionsSchema),
  roleController.updatePermissions.bind(roleController)
);

export default roleRoutes;