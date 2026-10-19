import { Request, Response } from "express";
import { validarDatos } from "../../validation/validarDatos";
import { datosProgresoSchema } from "./progreso.schemas";
import { ProgresoService } from "./progreso.service";

export class ProgresoController {
  constructor(private readonly service: ProgresoService) {}

  registrar = (req: Request, res: Response): void => {
    const datos = validarDatos(datosProgresoSchema, req.body);
    res.json(this.service.registrarProgreso(datos));
  };

  consultarLecciones = (
    req: Request<{ colaboradorId: string; cursoId: string }>,
    res: Response,
  ): void => {
    const { colaboradorId, cursoId } = req.params;
    res.json(this.service.consultarLecciones(colaboradorId, cursoId));
  };
}
