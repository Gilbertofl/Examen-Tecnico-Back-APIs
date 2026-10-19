import { Colaborador } from "./colaborador";

export class ColaboradoresRepository {
  private readonly colaboradoresPorId: Map<string, Colaborador>;

  constructor(registrosIniciales: Colaborador[]) {
    this.colaboradoresPorId = new Map(
      registrosIniciales.map((colaborador) => [colaborador.id, colaborador]),
    );
  }

  listarTodos(): Colaborador[] {
    return [...this.colaboradoresPorId.values()];
  }

  buscarPorId(id: string): Colaborador | undefined {
    return this.colaboradoresPorId.get(id);
  }

  guardar(colaborador: Colaborador): void {
    this.colaboradoresPorId.set(colaborador.id, colaborador);
  }
}
