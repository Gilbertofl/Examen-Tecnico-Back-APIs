import path from "node:path";
import { NotFoundError, UnsupportedMediaTypeError } from "../../errors/httpErrors";
import { ColaboradoresService } from "../colaboradores/colaboradores.service";
import { AlmacenamientoDeVideos } from "./almacenamientoDeVideos";
import { ArchivoSubido, Video } from "./video";
import { VideosRepository } from "./videos.repository";

export class VideosService {
  constructor(
    private readonly repository: VideosRepository,
    private readonly almacenamiento: AlmacenamientoDeVideos,
    private readonly colaboradoresService: ColaboradoresService,
  ) {}

  async registrar(colaboradorId: string, archivo: ArchivoSubido): Promise<Video> {
    try {
      this.colaboradoresService.obtenerActivoPorId(colaboradorId);
      await this.verificarQueElContenidoEsMp4(archivo.nombreArchivo);
    } catch (error) {
      await this.almacenamiento.eliminar(archivo.nombreArchivo);
      throw error;
    }

    const video: Video = {
      id: path.parse(archivo.nombreArchivo).name,
      colaboradorId,
      nombreArchivo: archivo.nombreArchivo,
      tamanioBytes: archivo.tamanioBytes,
      creadoEn: new Date().toISOString(),
    };
    this.repository.guardar(video);

    return video;
  }

  listarDelColaborador(colaboradorId: string): Video[] {
    this.colaboradoresService.obtenerActivoPorId(colaboradorId);
    return this.repository.listarPorColaborador(colaboradorId);
  }

  async obtenerRutaDelVideo(colaboradorId: string, videoId: string): Promise<string> {
    const video = this.obtenerVideoDelColaborador(colaboradorId, videoId);

    if (!(await this.almacenamiento.existe(video.nombreArchivo))) {
      throw new NotFoundError("El archivo del video no está disponible");
    }

    return this.almacenamiento.rutaDe(video.nombreArchivo);
  }

  private obtenerVideoDelColaborador(colaboradorId: string, videoId: string): Video {
    this.colaboradoresService.obtenerActivoPorId(colaboradorId);
    const video = this.repository.buscarPorId(videoId);

    if (!video || video.colaboradorId !== colaboradorId) {
      throw new NotFoundError("Video no encontrado");
    }

    return video;
  }

  private async verificarQueElContenidoEsMp4(nombreArchivo: string): Promise<void> {
    if (!(await this.almacenamiento.tieneFirmaMp4(nombreArchivo))) {
      throw new UnsupportedMediaTypeError(
        "El contenido del archivo no corresponde a un video MP4 válido",
      );
    }
  }
}
