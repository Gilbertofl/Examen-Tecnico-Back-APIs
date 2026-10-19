import { Request, Response } from "express";
import { validarDatos } from "../../validation/validarDatos";
import {
  datosColaboradorSchema,
  solicitudSincronizacionSchema,
} from "./colaboradores.schemas";
import { ColaboradoresService } from "./colaboradores.service";

export class ColaboradoresController {
  constructor(private readonly service: ColaboradoresService) {}

  listar = (_req: Request, res: Response): void => {
    res.json(this.service.listarActivos());
  };

  obtener = (req: Request<{ id: string }>, res: Response): void => {
    res.json(this.service.obtenerActivoPorId(req.params.id));
  };

  crear = (req: Request, res: Response): void => {
    const datos = validarDatos(datosColaboradorSchema, req.body);
    res.status(201).json(this.service.crear(datos));
  };

  eliminar = (req: Request<{ id: string }>, res: Response): void => {
    this.service.eliminar(req.params.id);
    res.status(204).send();
  };

  sincronizar = (req: Request, res: Response): void => {
    const { colaboradores } = validarDatos(solicitudSincronizacionSchema, req.body);
    res.json(this.service.sincronizar(colaboradores));
  };
}
