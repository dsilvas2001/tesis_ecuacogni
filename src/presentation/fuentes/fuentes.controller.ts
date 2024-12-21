import { FuentesRepository, FuentesUseCase } from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class FuentesController {
  constructor(private readonly fuentesRepository: FuentesRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getFuentes = (req: Request, res: Response) => {
    new FuentesUseCase(this.fuentesRepository)
      .execute()
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
}
