import { randomUUID } from "node:crypto";
import path from "node:path";
import { Request, RequestHandler } from "express";
import multer from "multer";
import { environment } from "../../config/environment";
import {
  BadRequestError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from "../../errors/httpErrors";

export const CAMPO_ARCHIVO_VIDEO = "video";

const EXTENSION_PERMITIDA = ".mp4";
const TIPO_MIME_PERMITIDO = "video/mp4";
const BYTES_POR_MEGABYTE = 1024 * 1024;

const almacenamientoEnDisco = multer.diskStorage({
  destination: environment.videoStorageDirectory,
  filename: (_req, _archivo, callback) => callback(null, `${randomUUID()}${EXTENSION_PERMITIDA}`),
});

function aceptarSoloMp4(
  _req: Request,
  archivo: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  const extension = path.extname(archivo.originalname).toLowerCase();
  const declaraMp4 = archivo.mimetype === TIPO_MIME_PERMITIDO && extension === EXTENSION_PERMITIDA;

  if (declaraMp4) {
    callback(null, true);
    return;
  }

  callback(new UnsupportedMediaTypeError("Solo se aceptan archivos de video en formato MP4"));
}

const recibirArchivo = multer({
  storage: almacenamientoEnDisco,
  fileFilter: aceptarSoloMp4,
  limits: { fileSize: environment.maxVideoSizeBytes, files: 1 },
}).single(CAMPO_ARCHIVO_VIDEO);

function traducirErrorDeCarga(error: unknown): unknown {
  if (!(error instanceof multer.MulterError)) {
    return error;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    const limiteEnMegabytes = environment.maxVideoSizeBytes / BYTES_POR_MEGABYTE;
    return new PayloadTooLargeError(
      `El video supera el tamaño máximo permitido de ${limiteEnMegabytes} MB`,
    );
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new BadRequestError(`El archivo debe enviarse en el campo '${CAMPO_ARCHIVO_VIDEO}'`);
  }

  return new BadRequestError("La solicitud de carga no es válida");
}

export const recibirVideo: RequestHandler = (req, res, next) => {
  recibirArchivo(req, res, (error: unknown) => next(traducirErrorDeCarga(error)));
};
