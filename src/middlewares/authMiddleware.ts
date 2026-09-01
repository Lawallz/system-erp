import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';
import prisma from '../config/prisma.js';

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token de autenticação não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    req.user = {
      id: decoded.sub,
      roleId: '',
      permissions: [],
    };

    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}

export function verifyPermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
        return;
      }

      const userWithPermissions = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!userWithPermissions || !userWithPermissions.isActive) {
        res.status(401).json({ status: 'error', message: 'Usuário não encontrado ou inativo' });
        return;
      }

      const permissions = userWithPermissions.role.rolePermissions.map(
        (rp) => rp.permission.name
      );

      req.user.roleId = userWithPermissions.roleId;
      req.user.permissions = permissions;

      const hasPermission = permissions.includes(requiredPermission);

      if (!hasPermission) {
        res.status(403).json({ status: 'error', message: 'Acesso negado: permissão insuficiente' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}