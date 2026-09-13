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
 *     responses:
 *       201:
 *         description: Fornecedor cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
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
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor encontrado com sucesso
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
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Fornecedor não encontrado
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
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor ativado com sucesso
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
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor desativado com sucesso
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