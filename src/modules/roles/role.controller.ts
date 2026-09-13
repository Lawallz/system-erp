import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service.js';

export class RoleController {
  private roleService = new RoleService();

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const role = await this.roleService.create(
        req.body,
        userId,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const roles = await this.roleService.list();

      res.status(200).json({
        status: 'success',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const role = await this.roleService.findById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const role = await this.roleService.update(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuário não autenticado',
        });
        return;
      }

      const role = await this.roleService.updatePermissions(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const permissions = await this.roleService.listPermissions();

      res.status(200).json({
        status: 'success',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }
}