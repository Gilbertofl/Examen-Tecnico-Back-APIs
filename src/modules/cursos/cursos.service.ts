import { NotFoundError } from "../../errors/httpErrors";
import { Curso } from "./curso";
import { CursosRepository } from "./cursos.repository";

export class CursosService {
  constructor(private readonly repository: CursosRepository) {}

  obtenerPorId(id: string): Curso {
    const curso = this.repository.buscarPorId(id);

    if (!curso) {
      throw new NotFoundError("Curso no encontrado");
    }

    return curso;
  }
}
