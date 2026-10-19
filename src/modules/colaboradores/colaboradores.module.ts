import { ColaboradoresController } from "./colaboradores.controller";
import { ColaboradoresRepository } from "./colaboradores.repository";
import { crearColaboradoresRouter } from "./colaboradores.routes";
import { ColaboradoresService } from "./colaboradores.service";
import registrosIniciales from "./colaboradores.seed.json";

const repository = new ColaboradoresRepository(registrosIniciales);

export const colaboradoresService = new ColaboradoresService(repository);
export const colaboradoresRouter = crearColaboradoresRouter(
  new ColaboradoresController(colaboradoresService),
);
