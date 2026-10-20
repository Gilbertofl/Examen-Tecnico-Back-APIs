export interface Video {
  id: string;
  colaboradorId: string;
  nombreArchivo: string;
  tamanioBytes: number;
  creadoEn: string;
}

export interface ArchivoSubido {
  nombreArchivo: string;
  tamanioBytes: number;
}
