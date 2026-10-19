import { z } from "zod";
import { textoObligatorio } from "../../validation/camposComunes";

const correoValido = z
  .string({ error: "El correo es obligatorio y debe ser texto" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "El correo no tiene un formato válido" }));

export const datosColaboradorSchema = z.object({
  nombre: textoObligatorio("El nombre"),
  correo: correoValido,
  puesto: textoObligatorio("El puesto"),
});

export const registroSincronizadoSchema = datosColaboradorSchema.extend({
  id: textoObligatorio("El id"),
});

export const solicitudSincronizacionSchema = z.object({
  colaboradores: z.array(z.unknown(), {
    error: "Debe ser una lista de registros",
  }),
});
