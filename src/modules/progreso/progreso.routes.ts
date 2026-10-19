import { Router } from "express";
import { ProgresoController } from "./progreso.controller";

export function crearProgresoRouter(controller: ProgresoController): Router {
  const router = Router();

  router.post("/", controller.registrar);
  router.get("/colaboradores/:colaboradorId/cursos/:cursoId", controller.consultarLecciones);

  return router;
}
