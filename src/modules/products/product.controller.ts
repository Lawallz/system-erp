import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import { z } from 'zod';
import { listRecords } from '../../shared/listing.js';
import { isPaged } from '../../shared/pagination.js';
import { sendPage } from '../../shared/listing.js';
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
  async details(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = productIdSchema.parse(req.params.id);
      const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
      if (!product) throw new AppError('Produto não encontrado', 404);
      res.json({ status: 'success', data: product });
    } catch (error) { next(error); }
  }
  async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = productIdSchema.parse(req.params.id);
      const kind = z.enum(['sales', 'purchases', 'movements']).parse(req.params.kind);
      if (!await prisma.product.findUnique({ where: { id }, select: { id: true } })) throw new AppError('Produto não encontrado', 404);
      const map = { sales: 'productSales', purchases: 'productPurchases', movements: 'productMovements' } as const;
      res.json({ status: 'success', data: await listRecords(map[kind], req.query, id) });
    } catch (error) { next(error); }
  }

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
      if (isPaged(req)) { await sendPage(req, res, 'categories'); return; }
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
      if (isPaged(req)) { await sendPage(req, res, 'products'); return; }
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
