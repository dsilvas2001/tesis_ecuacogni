import { Router } from "express";
import { FuentesDatasourceImpl } from "../../infrastructure/datasources/fuentes.datasource.impl";
import { FuentesController } from "./fuentes.controller";
import { FuentesRepositoryImpl } from "../../infrastructure";
import { Request, Response } from "express";

export class FuentesRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new FuentesDatasourceImpl();
    const fuentesRepositoryI = new FuentesRepositoryImpl(datasourceI);
    const controller = new FuentesController(fuentesRepositoryI);

    router.get("/", controller.getFuentes);

    // router.get("/", (req: Request, res: Response) => {
    //   res.send("Aquí están las fuentes");
    // });

    return router;
    //
  }
}
