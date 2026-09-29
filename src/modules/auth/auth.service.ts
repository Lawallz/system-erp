import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import { loginSchema } from './auth.schema.js';
import { z } from 'zod';

type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  async session(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: {
          select: {
            name: true,
            rolePermissions: {
              select: { permission: { select: { name: true } } },
            },
          },
        },
      },
    });
    if (!user || !user.isActive)
      throw new AppError('Usuário não encontrado ou inativo', 401);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions: user.role.rolePermissions.map(
        (item) => item.permission.name,
      ),
    };
  }

  async execute({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign({}, secret, {
      subject: user.id,
      expiresIn: expiresIn as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.rolePermissions.map(
          (item) => item.permission.name,
        ),
      },
    };
  }
}
