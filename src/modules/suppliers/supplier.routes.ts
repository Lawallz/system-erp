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

/**
 * @swagger
 * tags:
 *   - name: Suppliers
 *     description: Gerenciamento de fornecedores
 */

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Cadastra um novo fornecedor
 *     tags:
 *       - Suppliers
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
 *                 example: Distribuidora Tech LTDA
 *               document:
 *                 type: string
 *                 minLength: 5
 *                 example: "12345678000199"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contato@distribuidoratech.com.br
 *               phone:
 *                 type: string
 *                 minLength: 8
 *                 example: "11988887777"
 *               address:
 *                 type: string
 *                 minLength: 3
 *                 example: São Paulo - SP, Brasil
 *           example:
 *             name: Distribuidora Tech LTDA
 *             document: "12345678000199"
 *             email: contato@distribuidoratech.com.br
 *             phone: "11988887777"
 *             address: São Paulo - SP, Brasil
 *     responses:
 *       201:
 *         description: Fornecedor cadastrado com sucesso
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
 *                       example: Distribuidora Tech LTDA
 *                     document:
 *                       type: string
 *                       nullable: true
 *                       example: "12345678000199"
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                       example: contato@distribuidoratech.com.br
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "11988887777"
 *                     address:
 *                       type: string
 *                       nullable: true
 *                       example: São Paulo - SP, Brasil
 *                     isActive:
 *                       type: boolean
 *                       example: true
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
 *         description: Já existe um fornecedor com este nome ou documento
 */
supplierRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('suppliers:create'),
  validateSchema(createSupplierSchema),
  supplierController.create.bind(supplierController)
);

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Lista os fornecedores
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fornecedores retornada com sucesso
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
 *                         example: Fornecedor Teste LTDA
 *                       document:
 *                         type: string
 *                         nullable: true
 *                         example: "12345678000199"
 *                       email:
 *                         type: string
 *                         format: email
 *                         nullable: true
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                       address:
 *                         type: string
 *                         nullable: true
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
supplierRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('suppliers:read'),
  supplierController.list.bind(supplierController)
);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Busca um fornecedor pelo ID
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor encontrado com sucesso
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
 *                     document:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     purchases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           supplierId:
 *                             type: string
 *                             format: uuid
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                           status:
 *                             type: string
 *                             example: PENDING
 *                           totalAmount:
 *                             type: string
 *                             example: "500"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Fornecedor não encontrado
 */
supplierRoutes.get(
  '/:id',
  ensureAuthenticated,
  verifyPermission('suppliers:read'),
  supplierController.findById.bind(supplierController)
);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Atualiza um fornecedor
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
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
 *                 example: Distribuidora Tech Brasil LTDA
 *               document:
 *                 type: string
 *                 minLength: 5
 *                 example: "12345678000199"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: vendas@distribuidoratech.com.br
 *               phone:
 *                 type: string
 *                 minLength: 8
 *                 example: "11999998888"
 *               address:
 *                 type: string
 *                 minLength: 3
 *                 example: São Bernardo do Campo - SP, Brasil
 *           example:
 *             name: Distribuidora Tech Brasil LTDA
 *             email: vendas@distribuidoratech.com.br
 *             phone: "11999998888"
 *             address: São Bernardo do Campo - SP, Brasil
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
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
 *                     document:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
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
 *         description: Fornecedor não encontrado
 *       409:
 *         description: Já existe outro fornecedor com este nome ou documento
 */
supplierRoutes.put(
  '/:id',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  validateSchema(updateSupplierSchema),
  supplierController.update.bind(supplierController)
);

/**
 * @swagger
 * /api/suppliers/{id}/activate:
 *   patch:
 *     summary: Ativa um fornecedor
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor ativado com sucesso
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
 *                     document:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Fornecedor já está ativo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Fornecedor não encontrado
 */
supplierRoutes.patch(
  '/:id/activate',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  supplierController.activate.bind(supplierController)
);

/**
 * @swagger
 * /api/suppliers/{id}/deactivate:
 *   patch:
 *     summary: Desativa um fornecedor
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor desativado com sucesso
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
 *                     document:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Fornecedor já está inativo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Fornecedor não encontrado
 */
supplierRoutes.patch(
  '/:id/deactivate',
  ensureAuthenticated,
  verifyPermission('suppliers:update'),
  supplierController.deactivate.bind(supplierController)
);

export default supplierRoutes;