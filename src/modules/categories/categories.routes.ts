import { Router } from 'express';

import { CategoriesController } from './categories.controller.js';

import { ensureAuthenticated } from '../../middlewares/authMiddleware.js';

import { validateSchema } from '../../middlewares/validateSchema.js';

import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.schema.js';

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
 *                 example: Informática
 *               description:
 *                 type: string
 *                 example: Produtos e acessórios de informática
 *           example:
 *             name: Informática
 *             description: Produtos e acessórios de informática
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
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
 *                       example: Informática
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: Produtos e acessórios de informática
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos ou categoria já cadastrada
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
 *                         example: Informática
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
 *                           products:
 *                             type: integer
 *                             example: 4
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
 *           format: uuid
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada com sucesso
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
 *                       example: Informática
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           sku:
 *                             type: string
 *                             example: PROD-001
 *                           name:
 *                             type: string
 *                             example: Teclado Mecânico
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           price:
 *                             type: string
 *                             example: "249.90"
 *                           costPrice:
 *                             type: string
 *                             example: "150.00"
 *                           stockQuantity:
 *                             type: integer
 *                             example: 10
 *                           minStockAlert:
 *                             type: integer
 *                             example: 5
 *                           categoryId:
 *                             type: string
 *                             format: uuid
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 *           format: uuid
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
 *                 example: Informática e Tecnologia
 *               description:
 *                 type: string
 *                 example: Produtos, periféricos e acessórios de tecnologia
 *           example:
 *             name: Informática e Tecnologia
 *             description: Produtos, periféricos e acessórios de tecnologia
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
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
 *                       example: Informática e Tecnologia
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
 *         description: Dados inválidos ou já existe outra categoria com esse nome
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
 *           format: uuid
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria excluída com sucesso
 *       400:
 *         description: Não é possível excluir uma categoria com produtos vinculados
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