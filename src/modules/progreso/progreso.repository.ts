import { RegistroProgreso } from "./progreso";

export class ProgresoRepository {
  private readonly registrosPorClave = new Map<string, RegistroProgreso>();

  buscar(colaboradorId: string, cursoId: string, leccionId: string): RegistroProgreso | undefined {
    return this.registrosPorClave.get(construirClave(colaboradorId, cursoId, leccionId));
  }

  listarPorColaboradorYCurso(colaboradorId: string, cursoId: string): RegistroProgreso[] {
    return [...this.registrosPorClave.values()].filter(
      (registro) => registro.colaboradorId === colaboradorId && registro.cursoId === cursoId,
    );
  }

  guardar(registro: RegistroProgreso): void {
    const clave = construirClave(registro.colaboradorId, registro.cursoId, registro.leccionId);
    this.registrosPorClave.set(clave, registro);
  }
}

function construirClave(colaboradorId: string, cursoId: string, leccionId: string): string {
  return [colaboradorId, cursoId, leccionId].join("|");
}
