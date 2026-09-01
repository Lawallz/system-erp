import { Router } from 'express';
import { SalesController } from './sales.controller.js';
import { ensureAuthenticated } from '../../middlewares/authMiddleware.js';
import { validateSchema } from '../../middlewares/validateSchema.js';
import { createSaleSchema } from './sales.schema.js';

const router = Router();
const salesController = new SalesController();

router.use(ensureAuthenticated);

router.post('/', validateSchema(createSaleSchema), salesController.create);
router.get('/', salesController.list);

export default router;
