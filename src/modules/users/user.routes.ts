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

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags:
 *       - Users
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
 *               - email
 *               - password
 *               - roleId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@minierp.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 example: eff161d8-a852-4538-ba8d-6c41d0d99b89
 *           example:
 *             name: João da Silva
 *             email: joao@minierp.com
 *             password: "123456"
 *             roleId: eff161d8-a852-4538-ba8d-6c41d0d99b89
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
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
 *                       example: João da Silva
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: joao@minierp.com
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Administrador
 *                         description:
 *                           type: string
 *                           nullable: true
 *                     createdAt:
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
 *         description: Já existe um usuário com este e-mail
 */
userRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('users:create'),
  validateSchema(createUserSchema),
  userController.create.bind(userController)
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista os usuários
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
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
 *                       email:
 *                         type: string
 *                         format: email
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
userRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('users:read'),
  userController.list.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
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
 *                     email:
 *                       type: string
 *                       format: email
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         rolePermissions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               roleId:
 *                                 type: string
 *                                 format: uuid
 *                               permissionId:
 *                                 type: string
 *                                 format: uuid
 *                               permission:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   name:
 *                                     type: string
 *                                     example: users:read
 *                                   description:
 *                                     type: string
 *                                     nullable: true
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:read'),
  userController.findById.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
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
 *                 example: João da Silva Atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao.atualizado@minierp.com
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 example: 88c8fc50-e401-4ef6-b13d-dfb9072783b4
 *           example:
 *             name: João da Silva Atualizado
 *             email: joao.atualizado@minierp.com
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                     email:
 *                       type: string
 *                       format: email
 *                     isActive:
 *                       type: boolean
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
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
 *         description: Usuário ou função não encontrada
 *       409:
 *         description: Já existe outro usuário com este e-mail
 */
userRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updateUserSchema),
  userController.update.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}/password:
 *   patch:
 *     summary: Atualiza a senha de um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "654321"
 *           example:
 *             password: "654321"
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.patch(
  '/:id/password',
  ensureAuthenticated,
  verifyPermission('users:update'),
  validateSchema(updatePasswordSchema),
  userController.updatePassword.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Desativa um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
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
 *                     email:
 *                       type: string
 *                       format: email
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     roleId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Usuário já está inativo ou tentativa de desativar o próprio usuário
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.patch(
  '/:id/deactivate',
  ensureAuthenticated,
  verifyPermission('users:delete'),
  userController.deactivate.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Ativa um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário ativado com sucesso
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
 *                     email:
 *                       type: string
 *                       format: email
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     roleId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Usuário já está ativo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.patch(
  '/:id/activate',
  ensureAuthenticated,
  verifyPermission('users:update'),
  userController.activate.bind(userController)
);

export default userRoutes;