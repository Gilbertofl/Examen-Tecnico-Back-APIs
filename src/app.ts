import express, { Express } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { apiRouter } from "./routes";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
