import { Request, Response } from "express";
import { CustomError } from "../../infrastructure";
import { PacienteDto, PacienteRepository } from "../../domain";
import { PacienteUseCase } from "../../domain/use-cases/paciente.use-case";
export class PacienteController {
  constructor(private readonly pacienteRepository: PacienteRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };
  /**
   *
   * @param req
   * @param res
   * @returns
   */
  registerPaciente = async (req: Request, res: Response): Promise<void> => {
    const [error, pacienteDto] = PacienteDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new PacienteUseCase(this.pacienteRepository)
      .execute(pacienteDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  getAllPaciente = async (req: Request, res: Response) => {
    new PacienteUseCase(this.pacienteRepository)
      .executeAll()
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  countAllPaciente = async (req: Request, res: Response) => {
    new PacienteUseCase(this.pacienteRepository)
      .executeCount()
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  updatePaciente = async (req: Request, res: Response) => {
    const [error, pacienteDto] = PacienteDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }
    new PacienteUseCase(this.pacienteRepository)
      .executeUpdate(req.params.id, pacienteDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  deletePaciente = async (req: Request, res: Response) => {
    new PacienteUseCase(this.pacienteRepository)
      .executeDelete(req.params.id)
      .then(() => res.json({ message: "Paciente deleted" }))
      .catch((error) => this.handleError(error, res));
  };
}
