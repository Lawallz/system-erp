import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import {
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productListSchema,
} from './product.schema.js';

export class ProductController {
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = createCategorySchema.parse(req.body);
      const productService = new ProductService();
      const category = await productService.createCategory(data);

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async listCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productService = new ProductService();
      const categories = await productService.listCategories();

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = createProductSchema.parse(req.body);
      const userId = req.user?.id || '';
      const ipAddress = req.ip;

      const productService = new ProductService();
      const product = await productService.createProduct(
        data,
        userId,
        ipAddress,
      );

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async listProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productService = new ProductService();
      const { status } = productListSchema.parse(req.query);
      const products = await productService.listProducts(status);

      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = productIdSchema.parse(req.params.id);
      const data = updateProductSchema.parse(req.body);
      res.json(
        await new ProductService().updateProduct(
          id,
          data,
          req.user!.id,
          req.ip,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async activate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = productIdSchema.parse(req.params.id);
      res.json(
        await new ProductService().setActive(id, true, req.user!.id, req.ip),
      );
    } catch (error) {
      next(error);
    }
  }

  async deactivate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = productIdSchema.parse(req.params.id);
      res.json(
        await new ProductService().setActive(id, false, req.user!.id, req.ip),
      );
    } catch (error) {
      next(error);
    }
  }
}
