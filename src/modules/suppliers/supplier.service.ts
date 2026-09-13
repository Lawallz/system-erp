import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';

import {
  CreateSupplierInput,
  UpdateSupplierInput,
} from './supplier.schema.js';

export class SupplierService {
  async create(
    data: CreateSupplierInput,
    userId: string,
    ipAddress?: string
  ) {
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { name: data.name },
          ...(data.document ? [{ document: data.document }] : []),
        ],
      },
    });

    if (existingSupplier) {
      if (existingSupplier.name === data.name) {
        throw new AppError(
          'Já existe um fornecedor com este nome',
          409
        );
      }

      if (
        data.document &&
        existingSupplier.document === data.document
      ) {
        throw new AppError(
          'Já existe um fornecedor com este documento',
          409
        );
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        document: data.document,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'supplier',
        resourceId: supplier.id,
        details: JSON.stringify({
          name: supplier.name,
          document: supplier.document,
        }),
        ipAddress,
      },
    });

    return supplier;
  }

  async list() {
    return prisma.supplier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!supplier) {
      throw new AppError(
        'Fornecedor não encontrado',
        404
      );
    }

    return supplier;
  }

  async update(
    id: string,
    data: UpdateSupplierInput,
    userId: string,
    ipAddress?: string
  ) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new AppError(
        'Fornecedor não encontrado',
        404
      );
    }

    if (data.name || data.document) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.document ? [{ document: data.document }] : []),
          ],
          NOT: {
            id,
          },
        },
      });

      if (existingSupplier) {
        if (
          data.name &&
          existingSupplier.name === data.name
        ) {
          throw new AppError(
            'Já existe outro fornecedor com este nome',
            409
          );
        }

        if (
          data.document &&
          existingSupplier.document === data.document
        ) {
          throw new AppError(
            'Já existe outro fornecedor com este documento',
            409
          );
        }
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'supplier',
        resourceId: id,
        details: JSON.stringify({
          before: supplier,
          after: updatedSupplier,
        }),
        ipAddress,
      },
    });

    return updatedSupplier;
  }

  async deactivate(
    id: string,
    userId: string,
    ipAddress?: string
  ) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new AppError(
        'Fornecedor não encontrado',
        404
      );
    }

    if (!supplier.isActive) {
      throw new AppError(
        'O fornecedor já está inativo',
        400
      );
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DEACTIVATE',
        resource: 'supplier',
        resourceId: id,
        details: JSON.stringify({
          supplierName: supplier.name,
        }),
        ipAddress,
      },
    });

    return updatedSupplier;
  }

  async activate(
    id: string,
    userId: string,
    ipAddress?: string
  ) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new AppError(
        'Fornecedor não encontrado',
        404
      );
    }

    if (supplier.isActive) {
      throw new AppError(
        'O fornecedor já está ativo',
        400
      );
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ACTIVATE',
        resource: 'supplier',
        resourceId: id,
        details: JSON.stringify({
          supplierName: supplier.name,
        }),
        ipAddress,
      },
    });

    return updatedSupplier;
  }
}