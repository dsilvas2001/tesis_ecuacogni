import { CategoriasRepository, CategoriasUseCase } from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class CategoriasController {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getCategorias = async (req: Request, res: Response) => {
    new CategoriasUseCase(this.categoriasRepository)
      .execute()
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}
