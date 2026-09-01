import { Request, Response } from 'express';
import { CategoriesService } from './categories.service.js';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async create(req: Request, res: Response) {
    const category = await categoriesService.create(req.body);
    return res.status(201).json({ status: 'success', data: category });
  }

  async list(req: Request, res: Response) {
    const categories = await categoriesService.list();
    return res.status(200).json({ status: 'success', data: categories });
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await categoriesService.findById(id);
    return res.status(200).json({ status: 'success', data: category });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const category = await categoriesService.update(id, req.body);
    return res.status(200).json({ status: 'success', data: category });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await categoriesService.delete(id);
    return res.status(204).send();
  }
}