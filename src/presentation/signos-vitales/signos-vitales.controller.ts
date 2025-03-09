import {
  SignosVitalesDto,
  SignosVitalesRepository,
  SignosVitalesUseCase,
} from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class SignosVitalesController {
  constructor(
    private readonly signosVitalesRepository: SignosVitalesRepository
  ) {}

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

  registerSignosVitales = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const [error, signosVitalesDto] = SignosVitalesDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new SignosVitalesUseCase(this.signosVitalesRepository)
      .execute(signosVitalesDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  updateSignosV = async (req: Request, res: Response) => {
    const [error, signosVitalesDto] = SignosVitalesDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }
    new SignosVitalesUseCase(this.signosVitalesRepository)
      .executeUpdate(req.params.id, req.params.fecha, signosVitalesDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  findByPacienteAndFecha = async (req: Request, res: Response) => {
    new SignosVitalesUseCase(this.signosVitalesRepository)
      .executeFindByPacienteAndFecha(req.params.id, req.params.fecha)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
  deleteSignosV = async (req: Request, res: Response) => {
    new SignosVitalesUseCase(this.signosVitalesRepository)
      .executeDelete(req.params.id, req.params.fecha)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
  countgetSignosV = async (req: Request, res: Response) => {
    new SignosVitalesUseCase(this.signosVitalesRepository)

      .executeCountAll(req.params.fecha)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  getAllSignosV = async (req: Request, res: Response) => {
    new SignosVitalesUseCase(this.signosVitalesRepository)
      .executeAll(req.params.fecha, req.params.status)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}
