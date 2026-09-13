import { Router } from 'express';

import { CategoriesController } from './categories.controller.js';

import { ensureAuthenticated } from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

import { createCategorySchema, updateCategorySchema } from './categories.schema.js';

const router = Router();

const categoriesController = new CategoriesController();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Gerenciamento de categorias
 */

router.use(ensureAuthenticated);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags:
 *       - Categories
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
 *                 description: Nome da categoria
 *                 example: Informática
 *               description:
 *                 type: string
 *                 description: Descrição opcional da categoria
 *                 example: Produtos e acessórios de informática
 *           example:
 *             name: Informática
 *             description: Produtos e acessórios de informática
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post(
  '/',
  validateSchema(createCategorySchema),
  categoriesController.create
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get(
  '/',
  categoriesController.list
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Categoria não encontrada
 */
router.get(
  '/:id',
  categoriesController.findById
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
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
 *                 description: Novo nome da categoria
 *                 example: Informática e Tecnologia
 *               description:
 *                 type: string
 *                 description: Nova descrição da categoria
 *                 example: Produtos, periféricos e acessórios de tecnologia
 *           example:
 *             name: Informática e Tecnologia
 *             description: Produtos, periféricos e acessórios de tecnologia
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Categoria não encontrada
 */
router.put(
  '/:id',
  validateSchema(updateCategorySchema),
  categoriesController.update
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria excluída com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Categoria não encontrada
 */
router.delete(
  '/:id',
  categoriesController.delete
);

export default router;