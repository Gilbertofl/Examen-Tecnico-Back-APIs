export interface RegistroProgreso {
  colaboradorId: string;
  cursoId: string;
  leccionId: string;
  porcentaje: number;
  actualizadoEn: string;
}

export type DatosProgreso = Pick<
  RegistroProgreso,
  "colaboradorId" | "cursoId" | "leccionId" | "porcentaje"
>;

export interface LeccionConAvance {
  leccionId: string;
  titulo: string;
  orden: number;
  porcentaje: number;
}

export interface ResumenDeLecciones {
  colaboradorId: string;
  cursoId: string;
  cursadas: LeccionConAvance[];
  noCursadas: LeccionConAvance[];
}
