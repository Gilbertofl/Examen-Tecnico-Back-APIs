import { Curso } from "./curso";

export class CursosRepository {
  private readonly cursosPorId: Map<string, Curso>;

  constructor(cursos: Curso[]) {
    this.cursosPorId = new Map(cursos.map((curso) => [curso.id, curso]));
  }

  buscarPorId(id: string): Curso | undefined {
    return this.cursosPorId.get(id);
  }
}
