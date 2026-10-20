import { environment } from "../../config/environment";
import { colaboradoresService } from "../colaboradores/colaboradores.module";
import { AlmacenamientoDeVideos } from "./almacenamientoDeVideos";
import { VideosController } from "./videos.controller";
import { VideosRepository } from "./videos.repository";
import { crearVideosRouter } from "./videos.routes";
import { VideosService } from "./videos.service";

const videosService = new VideosService(
  new VideosRepository(),
  new AlmacenamientoDeVideos(environment.videoStorageDirectory),
  colaboradoresService,
);

export const videosRouter = crearVideosRouter(new VideosController(videosService));
