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
 *                 description: Nome do usuário
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-mail do usuário
 *                 example: joao@minierp.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Senha do usuário
 *                 example: "123456"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da função atribuída ao usuário
 *                 example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *           example:
 *             name: João da Silva
 *             email: joao@minierp.com
 *             password: "123456"
 *             roleId: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       409:
 *         description: Usuário já cadastrado
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
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
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
 *                 description: Nome do usuário
 *                 example: João da Silva Atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-mail do usuário
 *                 example: joao.atualizado@minierp.com
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da função atribuída ao usuário
 *                 example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *           example:
 *             name: João da Silva Atualizado
 *             email: joao.atualizado@minierp.com
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Usuário não encontrado
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
 *                 description: Nova senha do usuário
 *                 example: "654321"
 *           example:
 *             password: "654321"
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
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
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
 *       400:
 *         description: Usuário já está inativo
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
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário ativado com sucesso
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