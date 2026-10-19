import { z } from "zod";
import { BadRequestError } from "../errors/httpErrors";

export function describirErroresDeValidacion(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const campo = issue.path.join(".");
      return campo ? `${campo}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

export function validarDatos<Schema extends z.ZodType>(
  schema: Schema,
  datos: unknown,
): z.output<Schema> {
  const resultado = schema.safeParse(datos);

  if (!resultado.success) {
    throw new BadRequestError(describirErroresDeValidacion(resultado.error));
  }

  return resultado.data;
}
