import { z } from "zod";
import { textoObligatorio } from "../../validation/camposComunes";

const porcentajeDeAvance = z
  .number({ error: "El porcentaje es obligatorio y debe ser numérico" })
  .int({ error: "El porcentaje debe ser un número entero" })
  .min(0, { error: "El porcentaje no puede ser menor a 0" })
  .max(100, { error: "El porcentaje no puede ser mayor a 100" });

export const datosProgresoSchema = z.object({
  colaboradorId: textoObligatorio("El colaboradorId"),
  cursoId: textoObligatorio("El cursoId"),
  leccionId: textoObligatorio("El leccionId"),
  porcentaje: porcentajeDeAvance,
});
