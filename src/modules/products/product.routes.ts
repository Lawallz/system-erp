import { Router } from 'express';

import { ProductController } from './product.controller.js';

import {
  ensureAuthenticated,
  verifyPermission
} from '../../middlewares/authMiddleware.js';

const productRoutes = Router();

const productController = new ProductController();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Gerenciamento de produtos
 *   - name: Product Categories
 *     description: Gerenciamento de categorias de produtos
 */

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Lista as categorias de produtos
 *     tags:
 *       - Product Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
productRoutes.get(
  '/categories',
  ensureAuthenticated,
  verifyPermission('products:read'),
  productController.listCategories.bind(productController)
);

/**
 * @swagger
 * /api/products/categories:
 *   post:
 *     summary: Cria uma nova categoria de produto
 *     tags:
 *       - Product Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
productRoutes.post(
  '/categories',
  ensureAuthenticated,
  verifyPermission('products:create'),
  productController.createCategory.bind(productController)
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista os produtos
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
productRoutes.get(
  '/',
  ensureAuthenticated,
  verifyPermission('products:read'),
  productController.listProducts.bind(productController)
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Cria um novo produto
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário sem permissão
 */
productRoutes.post(
  '/',
  ensureAuthenticated,
  verifyPermission('products:create'),
  productController.createProduct.bind(productController)
);

export default productRoutes;