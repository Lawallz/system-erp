import { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service.js';
import { createStockMovementSchema } from './stock.schema.js';

export class StockController {
  async registerMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createStockMovementSchema.parse(req.body);
      const userId = req.user?.id || '';
      const ipAddress = req.ip;

      const stockService = new StockService();
      const result = await stockService.registerMovement(data, userId, ipAddress);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stockService = new StockService();
      const movements = await stockService.listMovements();

      res.status(200).json(movements);
    } catch (error) {
      next(error);
    }
  }
}