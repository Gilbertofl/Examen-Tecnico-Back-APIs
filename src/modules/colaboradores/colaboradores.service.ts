import { randomUUID } from "node:crypto";
import { ConflictError, NotFoundError } from "../../errors/httpErrors";
import { describirErroresDeValidacion } from "../../validation/validarDatos";
import {
  Colaborador,
  DatosColaborador,
  RegistroSincronizado,
  ResultadoSincronizacion,
} from "./colaborador";
import { registroSincronizadoSchema } from "./colaboradores.schemas";
import { ColaboradoresRepository } from "./colaboradores.repository";

const MENSAJE_CORREO_EN_USO = "El correo ya pertenece a otro colaborador";

export class ColaboradoresService {
  constructor(private readonly repository: ColaboradoresRepository) {}

  listarActivos(): Colaborador[] {
    return this.repository.listarTodos().filter(estaActivo);
  }

  obtenerActivoPorId(id: string): Colaborador {
    const colaborador = this.repository.buscarPorId(id);

    if (!colaborador || !estaActivo(colaborador)) {
      throw new NotFoundError("Colaborador no encontrado");
    }

    return colaborador;
  }

  crear(datos: DatosColaborador): Colaborador {
    if (this.correoPerteneceAOtroColaborador(datos.correo)) {
      throw new ConflictError(MENSAJE_CORREO_EN_USO);
    }

    const colaborador: Colaborador = { id: randomUUID(), ...datos, eliminadoEn: null };
    this.repository.guardar(colaborador);

    return colaborador;
  }

  eliminar(id: string): void {
    const colaborador = this.obtenerActivoPorId(id);
    this.repository.guardar({ ...colaborador, eliminadoEn: new Date().toISOString() });
  }

  sincronizar(registrosRecibidos: unknown[]): ResultadoSincronizacion {
    const resultado: ResultadoSincronizacion = { creados: 0, actualizados: 0, rechazados: [] };

    registrosRecibidos.forEach((registroRecibido, posicion) => {
      const validacion = registroSincronizadoSchema.safeParse(registroRecibido);

      if (!validacion.success) {
        resultado.rechazados.push({
          posicion,
          motivo: describirErroresDeValidacion(validacion.error),
        });
        return;
      }

      const motivoDeRechazo = this.sincronizarRegistro(validacion.data, resultado);

      if (motivoDeRechazo) {
        resultado.rechazados.push({ posicion, motivo: motivoDeRechazo });
      }
    });

    return resultado;
  }

  private sincronizarRegistro(
    registro: RegistroSincronizado,
    resultado: ResultadoSincronizacion,
  ): string | undefined {
    const existente = this.repository.buscarPorId(registro.id);

    if (existente && !estaActivo(existente)) {
      return "El colaborador fue eliminado y no puede sincronizarse";
    }

    if (this.correoPerteneceAOtroColaborador(registro.correo, registro.id)) {
      return MENSAJE_CORREO_EN_USO;
    }

    this.repository.guardar({ ...registro, eliminadoEn: null });

    if (existente) {
      resultado.actualizados += 1;
    } else {
      resultado.creados += 1;
    }

    return undefined;
  }

  private correoPerteneceAOtroColaborador(correo: string, idPropio?: string): boolean {
    return this.listarActivos().some(
      (colaborador) => colaborador.correo === correo && colaborador.id !== idPropio,
    );
  }
}

function estaActivo(colaborador: Colaborador): boolean {
  return colaborador.eliminadoEn === null;
}
