import { EjercicioResultadoRepository } from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class EjercicioResultadoController {
  constructor(
    private readonly ejercicioResultadoRepository: EjercicioResultadoRepository
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };
  registerEjercicio = (req: Request, res: Response) => {
    this.ejercicioResultadoRepository
      .registerEjercicio(req.body)
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
  getEjercicio = (req: Request, res: Response) => {
    this.ejercicioResultadoRepository
      .getEjercicio(req.params.id_paciente)
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
}
