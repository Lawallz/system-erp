import { Request, Response, NextFunction } from 'express';

import { UserService } from './user.service.js';

export class UserController {
  private userService = new UserService();

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

      const user = await this.userService.create(
        req.body,
        userId,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        data: user,
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
      const users = await this.userService.list();

      res.status(200).json({
        status: 'success',
        data: users,
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
      const user = await this.userService.findById(
        req.params.id
      );

      res.status(200).json({
        status: 'success',
        data: user,
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

      const user = await this.userService.update(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(
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

      await this.userService.updatePassword(
        req.params.id,
        req.body,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        message: 'Senha atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(
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

      const user = await this.userService.deactivate(
        req.params.id,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async activate(
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

      const user = await this.userService.activate(
        req.params.id,
        userId,
        req.ip
      );

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}