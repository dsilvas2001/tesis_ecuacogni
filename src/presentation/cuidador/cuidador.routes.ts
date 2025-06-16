import { Router } from "express";
import {
  CuidadorDatasourceImpl,
  CuidadorRepositoryImpl,
} from "../../infrastructure";
import { CuidadorController } from "./cuidador.controller";

export class CuidadorRoutes {
  static get routes(): Router {
    const router = Router();

    const datasourceI = new CuidadorDatasourceImpl();
    const cuidadorEnrollmentRepositoryI = new CuidadorRepositoryImpl(
      datasourceI
    );
    const controller = new CuidadorController(cuidadorEnrollmentRepositoryI);
    router.get("/count/:centroId", controller.getCountCuidadores);
    router.get("/aprobados/:centroId", controller.getAprobados);
    router.get("/no-aprobados/:centroId", controller.getNoAprobados);
    router.post("/aprobar/:id", controller.aprobarCuidador);
    return router;
  }
}
