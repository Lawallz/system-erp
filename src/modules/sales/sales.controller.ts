import { Request, Response } from 'express';
import { SalesService } from './sales.service.js';

const salesService = new SalesService();

export class SalesController {
  async create(req: Request, res: Response) {
    const userId = req.user?.id; // Extraído do middleware de autenticação JWT
    const ipAddress = req.ip;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    const sale = await salesService.createSale(req.body, userId, ipAddress);
    return res.status(201).json({ status: 'success', data: sale });
  }

  async list(req: Request, res: Response) {
    const sales = await salesService.listSales();
    return res.status(200).json({ status: 'success', data: sales });
  }
}