import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { ensureAuthenticated } from '../../middlewares/authMiddleware.js';
import { validateSchema } from '../../middlewares/validateSchema.js';
import { createCategorySchema, updateCategorySchema } from './categories.schema.js';

const router = Router();
const categoriesController = new CategoriesController();

router.use(ensureAuthenticated);

router.post('/', validateSchema(createCategorySchema), categoriesController.create);
router.get('/', categoriesController.list);
router.get('/:id', categoriesController.findById);
router.put('/:id', validateSchema(updateCategorySchema), categoriesController.update);
router.delete('/:id', categoriesController.delete);

export default router;