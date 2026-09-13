import { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service.js';

export class StockController {
  async registerMovement(
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

      const ipAddress = req.ip;

      const stockService = new StockService();

      const result = await stockService.registerMovement(
        req.body,
        userId,
        ipAddress
      );

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMovements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stockService = new StockService();

      const movements = await stockService.listMovements();

      res.status(200).json({
        status: 'success',
        data: movements,
      });
    } catch (error) {
      next(error);
    }
  }
  async listLowStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stockService = new StockService();

    const products = await stockService.listLowStock();

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

}

