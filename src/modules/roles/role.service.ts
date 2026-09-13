import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import {
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from './role.schema.js';

export class RoleService {
  async create(data: CreateRoleInput, userId: string, ipAddress?: string) {
    const existingRole = await prisma.role.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingRole) {
      throw new AppError('Já existe uma função com este nome', 409);
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'role',
        resourceId: role.id,
        details: JSON.stringify({
          name: role.name,
          description: role.description,
        }),
        ipAddress,
      },
    });

    return role;
  }

  async list() {
    return prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            rolePermissions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Função não encontrada', 404);
    }

    return role;
  }

  async update(
    id: string,
    data: UpdateRoleInput,
    userId: string,
    ipAddress?: string
  ) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new AppError('Função não encontrada', 404);
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: {
          name: data.name,
        },
      });

      if (existingRole) {
        throw new AppError('Já existe uma função com este nome', 409);
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'role',
        resourceId: id,
        details: JSON.stringify({
          before: role,
          after: updatedRole,
        }),
        ipAddress,
      },
    });

    return updatedRole;
  }

  async updatePermissions(
    id: string,
    data: UpdateRolePermissionsInput,
    userId: string,
    ipAddress?: string
  ) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new AppError('Função não encontrada', 404);
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: data.permissionIds,
        },
      },
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new AppError('Uma ou mais permissões não foram encontradas', 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId: id,
        },
      });

      await tx.rolePermission.createMany({
        data: data.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });

      const updatedRole = await tx.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_PERMISSIONS',
          resource: 'role',
          resourceId: id,
          details: JSON.stringify({
            permissionIds: data.permissionIds,
          }),
          ipAddress,
        },
      });

      return updatedRole;
    });

    return result;
  }

  async listPermissions() {
    return prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}