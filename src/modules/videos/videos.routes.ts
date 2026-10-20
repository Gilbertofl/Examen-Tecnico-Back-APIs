import { Router } from "express";
import { VideosController } from "./videos.controller";
import { recibirVideo } from "./videos.upload";

export function crearVideosRouter(controller: VideosController): Router {
  const router = Router();

  router.post("/:colaboradorId/videos", recibirVideo, controller.subir);
  router.get("/:colaboradorId/videos", controller.listar);
  router.get("/:colaboradorId/videos/:videoId", controller.reproducir);

  return router;
}
