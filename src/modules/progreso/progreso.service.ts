import { NotFoundError } from "../../errors/httpErrors";
import { ColaboradoresService } from "../colaboradores/colaboradores.service";
import { Curso } from "../cursos/curso";
import { CursosService } from "../cursos/cursos.service";
import {
  DatosProgreso,
  LeccionConAvance,
  RegistroProgreso,
  ResumenDeLecciones,
} from "./progreso";
import { ProgresoRepository } from "./progreso.repository";

const PORCENTAJE_LECCION_COMPLETADA = 100;

export class ProgresoService {
  constructor(
    private readonly repository: ProgresoRepository,
    private readonly colaboradoresService: ColaboradoresService,
    private readonly cursosService: CursosService,
  ) {}

  registrarProgreso(datos: DatosProgreso): RegistroProgreso {
    this.colaboradoresService.obtenerActivoPorId(datos.colaboradorId);
    const curso = this.cursosService.obtenerPorId(datos.cursoId);
    verificarQueLaLeccionPerteneceAlCurso(curso, datos.leccionId);

    const registroPrevio = this.repository.buscar(
      datos.colaboradorId,
      datos.cursoId,
      datos.leccionId,
    );

    const registro: RegistroProgreso = {
      ...datos,
      porcentaje: Math.max(registroPrevio?.porcentaje ?? 0, datos.porcentaje),
      actualizadoEn: new Date().toISOString(),
    };
    this.repository.guardar(registro);

    return registro;
  }

  consultarLecciones(colaboradorId: string, cursoId: string): ResumenDeLecciones {
    this.colaboradoresService.obtenerActivoPorId(colaboradorId);
    const curso = this.cursosService.obtenerPorId(cursoId);

    const porcentajePorLeccion = new Map(
      this.repository
        .listarPorColaboradorYCurso(colaboradorId, cursoId)
        .map((registro) => [registro.leccionId, registro.porcentaje]),
    );

    const lecciones: LeccionConAvance[] = [...curso.lecciones]
      .sort((anterior, siguiente) => anterior.orden - siguiente.orden)
      .map((leccion) => ({
        leccionId: leccion.id,
        titulo: leccion.titulo,
        orden: leccion.orden,
        porcentaje: porcentajePorLeccion.get(leccion.id) ?? 0,
      }));

    return {
      colaboradorId,
      cursoId,
      cursadas: lecciones.filter(estaCompletada),
      noCursadas: lecciones.filter((leccion) => !estaCompletada(leccion)),
    };
  }
}

function verificarQueLaLeccionPerteneceAlCurso(curso: Curso, leccionId: string): void {
  const pertenece = curso.lecciones.some((leccion) => leccion.id === leccionId);

  if (!pertenece) {
    throw new NotFoundError("La lección no pertenece al curso indicado");
  }
}

function estaCompletada(leccion: LeccionConAvance): boolean {
  return leccion.porcentaje >= PORCENTAJE_LECCION_COMPLETADA;
}
