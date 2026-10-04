import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({
        status: "error",
        message: err.issues[0]?.message || "Dados inválidos",
        errors: err.issues,
      });
    return;
  }
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    res
      .status(409)
      .json({
        status: "error",
        message: "Já existe um registro com esses dados únicos.",
      });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
