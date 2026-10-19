export interface Leccion {
  id: string;
  titulo: string;
  orden: number;
}

export interface Curso {
  id: string;
  titulo: string;
  lecciones: Leccion[];
}
