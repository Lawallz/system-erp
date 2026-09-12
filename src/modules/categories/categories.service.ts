import prisma from '../../config/prisma.js';
import { AppError } from '../../errors/appError.js';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export class CategoriesService {
  async create(data: CreateCategoryInput) {
    const categoryExists = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (categoryExists) {
      throw new AppError('Já existe uma categoria cadastrada com esse nome', 400);
    }

    return prisma.category.create({
      data,
    });
  }

  async list() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryInput) {
    await this.findById(id);

    if (data.name) {
      const categoryExists = await prisma.category.findFirst({
        where: { name: data.name, NOT: { id } },
      });

      if (categoryExists) {
        throw new AppError('Já existe outra categoria com esse nome', 400);
      }
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const category = await this.findById(id);

    if (category.products && category.products.length > 0) {
      throw new AppError('Não é possível excluir uma categoria que possui produtos vinculados', 400);
    }

    return prisma.category.delete({
      where: { id },
    });
  }
}