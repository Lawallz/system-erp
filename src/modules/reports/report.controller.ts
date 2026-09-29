import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service.js';
import { ReportService } from './report.service.js';

export class ReportController {
  async inventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await new InventoryService().overview() });
    } catch (error) { next(error); }
  }

  private reportService = new ReportService();

  async sales(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await this.reportService.sales();

      res.status(200).json({
        status: 'success',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async stock(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await this.reportService.stock();

      res.status(200).json({
        status: 'success',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async products(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await this.reportService.products();

      res.status(200).json({
        status: 'success',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async abc(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await this.reportService.abc();

      res.status(200).json({
        status: 'success',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}