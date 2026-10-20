import { Video } from "./video";

export class VideosRepository {
  private readonly videosPorId = new Map<string, Video>();

  guardar(video: Video): void {
    this.videosPorId.set(video.id, video);
  }

  buscarPorId(id: string): Video | undefined {
    return this.videosPorId.get(id);
  }

  listarPorColaborador(colaboradorId: string): Video[] {
    return [...this.videosPorId.values()].filter(
      (video) => video.colaboradorId === colaboradorId,
    );
  }
}
