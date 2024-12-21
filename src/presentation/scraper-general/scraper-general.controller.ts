import { ScraperGeneralRepository, ScraperGeneralUseCase } from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class ScraperGeneralController {
  constructor(
    private readonly scraperGeneralRepository: ScraperGeneralRepository
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  getScraperGeneral = async (req: Request, res: Response) => {
    new ScraperGeneralUseCase(this.scraperGeneralRepository)
      .execute()
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}
