import { Router } from 'express';
import { AuthController } from './auth.controller.js';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.login.bind(authController));

export default authRoutes;