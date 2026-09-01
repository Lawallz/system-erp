import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.ts';
import { createCategorySchema, createProductSchema } from './product.schema.ts';

export class ProductController {
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createCategorySchema.parse(req.body);
      const productService = new ProductService();
      const category = await productService.createCategory(data);

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productService = new ProductService();
      const categories = await productService.listCategories();

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createProductSchema.parse(req.body);
      const userId = req.user?.id || '';
      const ipAddress = req.ip;

      const productService = new ProductService();
      const product = await productService.createProduct(data, userId, ipAddress);

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productService = new ProductService();
      const products = await productService.listProducts();

      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }
}