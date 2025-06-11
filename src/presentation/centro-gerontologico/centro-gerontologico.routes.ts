import { Router } from "express";
import { CentroDatasourceImpl } from "../../infrastructure/datasources/centro-gerontologico.datasource.impl";
import { CentroRepositoryImpl } from "../../infrastructure";
import { CentroController } from "./centro-gerontologico.controller";

export class CentroRoutes {
  static get routes(): Router {
    const router = Router();
    const centroDatasource = new CentroDatasourceImpl();
    const centroRepository = new CentroRepositoryImpl(centroDatasource);
    const centroController = new CentroController(centroRepository);

    router.post("/crear", centroController.crearCentro);
    router.post("/unirse", centroController.unirseCentro);

    return router;
  }
}
