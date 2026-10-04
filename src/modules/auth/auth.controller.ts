import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import prisma from "../../config/prisma.js";
import { AppError } from "../../errors/appError.js";
import { loginSchema } from "./auth.schema.js";

export class AuthController {
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      });
      if (!user || !user.isActive)
        throw new AppError("Usuário não encontrado ou inativo", 401);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.rolePermissions.map((rp) => rp.permission.name),
      });
    } catch (error) {
      next(error);
    }
  }

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
