import { Request, Response } from "express";
import { CentroRepository } from "../../domain";
import { CustomError } from "../../infrastructure";

export class CentroController {
  constructor(private readonly centroRepository: CentroRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  crearCentro = async (req: Request, res: Response) => {
    try {
      const data = await this.centroRepository.crearCentro(req.body);
      res.status(201).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  };
  unirseCentro = async (req: Request, res: Response) => {
    try {
      const data = await this.centroRepository.unirseCentro(req.body);
      res.status(200).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
