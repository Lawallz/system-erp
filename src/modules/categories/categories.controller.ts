import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service.js';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.create(req.body);
      return res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.list();
      return res.status(200).json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.findById(id);
      return res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.update(id, req.body);
      return res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await categoriesService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}