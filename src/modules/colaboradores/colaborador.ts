export interface Colaborador {
  id: string;
  nombre: string;
  correo: string;
  puesto: string;
  eliminadoEn: string | null;
}

export type DatosColaborador = Pick<Colaborador, "nombre" | "correo" | "puesto">;

export type RegistroSincronizado = DatosColaborador & Pick<Colaborador, "id">;

export interface RegistroRechazado {
  posicion: number;
  motivo: string;
}

export interface ResultadoSincronizacion {
  creados: number;
  actualizados: number;
  rechazados: RegistroRechazado[];
}
