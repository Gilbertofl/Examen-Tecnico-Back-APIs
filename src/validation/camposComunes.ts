import { z } from "zod";

export const textoObligatorio = (campo: string) =>
  z
    .string({ error: `${campo} es obligatorio y debe ser texto` })
    .trim()
    .min(1, { error: `${campo} no puede estar vacío` });
