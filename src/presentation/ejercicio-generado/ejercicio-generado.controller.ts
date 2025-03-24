import {
  EjercicioGeneradoRepository,
  EjercicioGeneradoUseCase,
} from "../../domain";
import { CustomError } from "../../infrastructure";

import { Request, Response } from "express";

export class EjercicioGeneradoController {
  constructor(
    private readonly ejercicioGeneradoRepository: EjercicioGeneradoRepository
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getEjercicioGenerado = async (req: Request, res: Response) => {
    new EjercicioGeneradoUseCase(this.ejercicioGeneradoRepository)
      .executeEjercicio(
        req.params.categoria,
        parseInt(req.params.numeroEjercicios, 10),
        req.body
      )
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  getRecomendaciones = async (req: Request, res: Response) => {
    const { tendencia, porcentajeExito, tiempoTranscurrido } = req.body;
    new EjercicioGeneradoUseCase(this.ejercicioGeneradoRepository)
      .executeRecomendaciones(tendencia, porcentajeExito, tiempoTranscurrido)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}
