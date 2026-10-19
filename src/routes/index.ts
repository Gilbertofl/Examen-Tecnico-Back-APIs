import { Router } from "express";
import { colaboradoresRouter } from "../modules/colaboradores/colaboradores.module";
import { progresoRouter } from "../modules/progreso/progreso.module";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/colaboradores", colaboradoresRouter);
apiRouter.use("/progreso", progresoRouter);
