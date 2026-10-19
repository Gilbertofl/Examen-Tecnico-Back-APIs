import { CursosRepository } from "./cursos.repository";
import { CursosService } from "./cursos.service";
import cursosIniciales from "./cursos.seed.json";

export const cursosService = new CursosService(new CursosRepository(cursosIniciales));
