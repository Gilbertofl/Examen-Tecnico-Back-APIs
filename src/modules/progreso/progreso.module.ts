import { colaboradoresService } from "../colaboradores/colaboradores.module";
import { cursosService } from "../cursos/cursos.module";
import { ProgresoController } from "./progreso.controller";
import { ProgresoRepository } from "./progreso.repository";
import { crearProgresoRouter } from "./progreso.routes";
import { ProgresoService } from "./progreso.service";

const progresoService = new ProgresoService(
  new ProgresoRepository(),
  colaboradoresService,
  cursosService,
);

export const progresoRouter = crearProgresoRouter(new ProgresoController(progresoService));
