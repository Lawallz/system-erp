import { Router } from 'express';

import { AuthController } from './auth.controller.js';

const authRoutes = Router();

const authController = new AuthController();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Realiza o login do usuário
 *     description: Autentica um usuário ativo e retorna um token JWT junto com seus dados básicos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@exemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT utilizado para autenticar as requisições protegidas.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *                     name:
 *                       type: string
 *                       example: Administrador
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: admin@minierp.com
 *                     role:
 *                       type: string
 *                       example: Admin
 *
 *       401:
 *         description: E-mail ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: E-mail ou senha inválidos
 *
 *       500:
 *         description: Erro interno no servidor
 */
authRoutes.post('/login', authController.login.bind(authController));

export default authRoutes;