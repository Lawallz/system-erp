import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/AppError.js';
import { loginSchema } from './auth.schema.ts';
import { z } from 'zod';

type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  async execute({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
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
      },
    };
  }
}