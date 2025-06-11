import {
  ReferenciaSignosVDto,
  ReferenciaSignosVRepository,
  ReferenciaSignosVUseCase,
} from "../../domain";
import { CustomError } from "../../infrastructure";
import { Request, Response } from "express";

export class ReferenciaSignosVController {
  constructor(
    private readonly referenciaSignosVRepository: ReferenciaSignosVRepository
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

  registerReferenciaSignosV = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const [error, referenciaSignosVDto] = ReferenciaSignosVDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }

    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .execute(referenciaSignosVDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  updateReferenciaSignosV = async (req: Request, res: Response) => {
    const [error, referenciaSignosVDto] = ReferenciaSignosVDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }
    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .executeUpdate(req.params.id, referenciaSignosVDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  getAllReferenciaSignosV = async (req: Request, res: Response) => {
    const centroId = req.params.centroId;

    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .executeAll(centroId)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  getNotReferenciaSignosV = async (req: Request, res: Response) => {
    const centroId = req.params.centroId;

    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .executeNotReferenciaSignosV(centroId)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  deleteReferenciaSignosV = async (req: Request, res: Response) => {
    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .executeDelete(req.params.id)
      .then(() => res.json({ message: "Referencia deleted" }))
      .catch((error) => this.handleError(error, res));
  };

  getCountReferenciaSignosV = async (req: Request, res: Response) => {
    const centroId = req.params.centroId;
    new ReferenciaSignosVUseCase(this.referenciaSignosVRepository)
      .executeCount(centroId)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}
