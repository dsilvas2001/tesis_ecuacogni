import { Request, Response } from "express";
import { CuidadorRepository } from "../../domain";
import { CustomError } from "../../infrastructure";

export class CuidadorController {
  constructor(private readonly repository: CuidadorRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getCountCuidadores = async (req: Request, res: Response): Promise<void> => {
    try {
      const counts = await this.repository.countCuidadoresPorEstado(
        req.params.centroId
      );
      res.json(counts);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getAprobados = async (req: Request, res: Response): Promise<void> => {
    try {
      const cuidadores = await this.repository.findAprobadosCuidadores(
        req.params.centroId
      );
      res.json(cuidadores);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getNoAprobados = async (req: Request, res: Response): Promise<void> => {
    try {
      const cuidadores = await this.repository.findNoAprobadosCuidadores(
        req.params.centroId
      );
      res.json(cuidadores);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  aprobarCuidador = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.repository.aprobarCuidador(id);
      res.json({ success: result });
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
