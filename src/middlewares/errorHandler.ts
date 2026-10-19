import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpErrors";

function isMalformedJsonBody(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (isMalformedJsonBody(error)) {
    res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
}
