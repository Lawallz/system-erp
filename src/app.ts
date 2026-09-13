import express from 'express';
import cors from 'cors';

import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import stockRoutes from './modules/stock/stock.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import supplierRoutes from './modules/suppliers/supplier.routes.js';
import purchaseRoutes from './modules/purchases/purchase.routes.js';
import userRoutes from './modules/users/user.routes.js';
import roleRoutes from './modules/roles/role.routes.js';
import reportRoutes from './modules/reports/report.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

export default app;