import { Router } from 'express';
import { AuthController } from './auth.controller.ts';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.login.bind(authController));

export default authRoutes;