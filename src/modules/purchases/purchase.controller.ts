import { Request, Response, NextFunction } from 'express';
import { PurchaseService } from './purchase.service.js';

export class PurchaseController {
  private purchaseService = new PurchaseService();

  async create(
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

      const purchase = await this.purchaseService.create(
        req.body,
        userId,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(
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

      const result = await this.purchaseService.addItem(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const purchases = await this.purchaseService.list();

      res.status(200).json({
        status: 'success',
        data: purchases,
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
      const purchase = await this.purchaseService.findById(
        req.params.id
      );

      res.status(200).json({
        status: 'success',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }

  async receive(
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

      const purchase = await this.purchaseService.receive(
        req.params.id,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }
}