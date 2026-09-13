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
 *                 example: Eletrônicos
 *               description:
 *                 type: string
 *                 description: Descrição opcional da categoria
 *                 example: Produtos eletrônicos e acessórios
 *           example:
 *             name: Eletrônicos
 *             description: Produtos eletrônicos e acessórios
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - price
 *               - costPrice
 *               - categoryId
 *             properties:
 *               sku:
 *                 type: string
 *                 minLength: 2
 *                 description: Código SKU do produto
 *                 example: PROD-001
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome do produto
 *                 example: Teclado Mecânico
 *               description:
 *                 type: string
 *                 description: Descrição opcional do produto
 *                 example: Teclado mecânico USB com iluminação
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 description: Preço de venda
 *                 example: 249.90
 *               costPrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 description: Preço de custo
 *                 example: 150.00
 *               minStockAlert:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Quantidade mínima para alerta de estoque
 *                 example: 5
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da categoria do produto
 *                 example: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
 *           example:
 *             sku: PROD-001
 *             name: Teclado Mecânico
 *             description: Teclado mecânico USB com iluminação
 *             price: 249.90
 *             costPrice: 150.00
 *             minStockAlert: 5
 *             categoryId: 3da575ee-ecae-40be-b5f7-1f74b9e576bc
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