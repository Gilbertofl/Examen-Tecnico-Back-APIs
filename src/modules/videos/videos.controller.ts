import { Request, Response } from "express";
import { BadRequestError } from "../../errors/httpErrors";
import { CAMPO_ARCHIVO_VIDEO } from "./videos.upload";
import { VideosService } from "./videos.service";

export class VideosController {
  constructor(private readonly service: VideosService) {}

  subir = async (req: Request<{ colaboradorId: string }>, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError(
        `Debe adjuntarse un archivo MP4 en el campo '${CAMPO_ARCHIVO_VIDEO}'`,
      );
    }

    const video = await this.service.registrar(req.params.colaboradorId, {
      nombreArchivo: req.file.filename,
      tamanioBytes: req.file.size,
    });

    res.status(201).json(video);
  };

  listar = (req: Request<{ colaboradorId: string }>, res: Response): void => {
    res.json(this.service.listarDelColaborador(req.params.colaboradorId));
  };

  reproducir = async (
    req: Request<{ colaboradorId: string; videoId: string }>,
    res: Response,
  ): Promise<void> => {
    const { colaboradorId, videoId } = req.params;
    const rutaDelVideo = await this.service.obtenerRutaDelVideo(colaboradorId, videoId);

    res.sendFile(rutaDelVideo, {
      headers: { "Content-Type": "video/mp4", "X-Content-Type-Options": "nosniff" },
    });
  };
}
