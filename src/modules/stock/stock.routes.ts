import { Router } from 'express';
import { StockController } from './stock.controller.js';
import { ensureAuthenticated, verifyPermission } from '../../middlewares/authMiddleware.js';

const stockRoutes = Router();
const stockController = new StockController();

stockRoutes.get('/movements', ensureAuthenticated, verifyPermission('stock:read'), stockController.listMovements.bind(stockController));
stockRoutes.post('/movements', ensureAuthenticated, verifyPermission('stock:create'), stockController.registerMovement.bind(stockController));

export default stockRoutes;