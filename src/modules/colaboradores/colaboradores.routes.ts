import { Router } from "express";
import { ColaboradoresController } from "./colaboradores.controller";

export function crearColaboradoresRouter(controller: ColaboradoresController): Router {
  const router = Router();

  router.get("/", controller.listar);
  router.get("/:id", controller.obtener);
  router.post("/", controller.crear);
  router.post("/sincronizacion", controller.sincronizar);
  router.delete("/:id", controller.eliminar);

  return router;
}
