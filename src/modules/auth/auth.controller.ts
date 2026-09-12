import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { loginSchema } from './auth.schema.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const authService = new AuthService();
      const result = await authService.execute(data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}