import { Router } from "express";
import { colaboradoresRouter } from "../modules/colaboradores/colaboradores.module";
import { progresoRouter } from "../modules/progreso/progreso.module";
import { videosRouter } from "../modules/videos/videos.module";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/colaboradores", colaboradoresRouter);
apiRouter.use("/colaboradores", videosRouter);
apiRouter.use("/progreso", progresoRouter);
