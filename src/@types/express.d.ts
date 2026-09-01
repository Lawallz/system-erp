import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roleId: string;
        permissions: string[];
      };
    }
  }
}