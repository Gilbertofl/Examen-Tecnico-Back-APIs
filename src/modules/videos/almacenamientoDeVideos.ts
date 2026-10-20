import { access, open, rm } from "node:fs/promises";
import path from "node:path";

const POSICION_FIRMA_MP4 = 4;
const FIRMA_MP4 = "ftyp";

export class AlmacenamientoDeVideos {
  constructor(private readonly directorio: string) {}

  rutaDe(nombreArchivo: string): string {
    return path.join(this.directorio, nombreArchivo);
  }

  async existe(nombreArchivo: string): Promise<boolean> {
    try {
      await access(this.rutaDe(nombreArchivo));
      return true;
    } catch {
      return false;
    }
  }

  async tieneFirmaMp4(nombreArchivo: string): Promise<boolean> {
    const archivo = await open(this.rutaDe(nombreArchivo), "r");

    try {
      const cabecera = Buffer.alloc(POSICION_FIRMA_MP4 + FIRMA_MP4.length);
      const { bytesRead } = await archivo.read(cabecera, 0, cabecera.length, 0);
      const firma = cabecera.toString("latin1", POSICION_FIRMA_MP4);

      return bytesRead === cabecera.length && firma === FIRMA_MP4;
    } finally {
      await archivo.close();
    }
  }

  async eliminar(nombreArchivo: string): Promise<void> {
    await rm(this.rutaDe(nombreArchivo), { force: true });
  }
}
