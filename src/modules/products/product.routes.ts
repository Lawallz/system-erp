import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { ensureAuthenticated, verifyPermission } from '../../middlewares/authMiddleware.js';

const productRoutes = Router();
const productController = new ProductController();

// Rotas de Categorias
productRoutes.get('/categories', ensureAuthenticated, verifyPermission('products:read'), productController.listCategories.bind(productController));
productRoutes.post('/categories', ensureAuthenticated, verifyPermission('products:create'), productController.createCategory.bind(productController));

// Rotas de Produtos
productRoutes.get('/', ensureAuthenticated, verifyPermission('products:read'), productController.listProducts.bind(productController));
productRoutes.post('/', ensureAuthenticated, verifyPermission('products:create'), productController.createProduct.bind(productController));

export default productRoutes;