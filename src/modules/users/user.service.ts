import bcrypt from 'bcrypt';

import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';

import {
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
} from './user.schema.js';

export class UserService {
  async create(
    data: CreateUserInput,
    userId: string,
    ipAddress?: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new AppError('Já existe um usuário com este e-mail', 409);
    }

    const role = await prisma.role.findUnique({
      where: {
        id: data.roleId,
      },
    });

    if (!role) {
      throw new AppError('Função não encontrada', 404);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'user',
        resourceId: user.id,
        details: JSON.stringify({
          name: user.name,
          email: user.email,
          roleId: user.roleId,
        }),
        ipAddress,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  async update(
    id: string,
    data: UpdateUserInput,
    userId: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        throw new AppError('Já existe outro usuário com este e-mail', 409);
      }
    }

    if (data.roleId) {
      const role = await prisma.role.findUnique({
        where: {
          id: data.roleId,
        },
      });

      if (!role) {
        throw new AppError('Função não encontrada', 404);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({
          before: {
            name: user.name,
            email: user.email,
            roleId: user.roleId,
          },
          after: {
            name: updatedUser.name,
            email: updatedUser.email,
            roleId: updatedUser.roleId,
          },
        }),
        ipAddress,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updatePassword(
    id: string,
    data: UpdatePasswordInput,
    userId: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PASSWORD',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({
          email: user.email,
        }),
        ipAddress,
      },
    });
  }

  async deactivate(
    id: string,
    userId: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.isActive) {
      throw new AppError('O usuário já está inativo', 400);
    }

    if (user.id === userId) {
      throw new AppError(
        'Você não pode desativar o próprio usuário',
        400
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: true,
  },
});

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DEACTIVATE',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({
          userEmail: user.email,
        }),
        ipAddress,
      },
    });

    return updatedUser;
  }

  async activate(
    id: string,
    userId: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.isActive) {
      throw new AppError('O usuário já está ativo', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ACTIVATE',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({
          userEmail: user.email,
        }),
        ipAddress,
      },
    });

    return updatedUser;
  }
}