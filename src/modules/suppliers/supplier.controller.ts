import { Request, Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service.js';

export class SupplierController {
  private supplierService = new SupplierService();

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const supplier = await this.supplierService.create(
        req.body,
        userId,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suppliers = await this.supplierService.list();

      res.status(200).json({
        status: 'success',
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const supplier = await this.supplierService.findById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const supplier = await this.supplierService.update(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const supplier = await this.supplierService.deactivate(
        req.params.id,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  async activate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const supplier = await this.supplierService.activate(
        req.params.id,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }
}