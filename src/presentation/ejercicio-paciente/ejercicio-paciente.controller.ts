import {
  EjercicioPacienteRepository,
  EjercicioPacienteUseCase,
} from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class EjercicioPacienteController {
  constructor(
    private readonly ejercicioPacienteRepository: EjercicioPacienteRepository
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getEjercicio = (req: Request, res: Response) => {
    new EjercicioPacienteUseCase(this.ejercicioPacienteRepository)
      .executeAll(
        req.params.fecha,
        req.params.status as "completo" | "incompleto" | "pendiente" | "todos",
        req.params.centroId
      )
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
  getCountEjercicio = (req: Request, res: Response) => {
    new EjercicioPacienteUseCase(this.ejercicioPacienteRepository)
      .executeCount(req.params.centroId)
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };

  getSelectCategoria = (req: Request, res: Response) => {
    new EjercicioPacienteUseCase(this.ejercicioPacienteRepository)
      .executeSelectCaregoria(req.body)
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
}
