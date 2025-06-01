import { Router } from "express";
import {
  EjercicioResultadoDatasourceImpl,
  EjercicioResultadoRepositoryImpl,
} from "../../infrastructure";
import { EjercicioResultadoController } from "./ejercicio-resultado.controller";

export class EjercicioResultadosRoutes {
  static get routes() {
    const router = Router();
    const datasourceI = new EjercicioResultadoDatasourceImpl();
    const ejercicioResultadoRepositoryI = new EjercicioResultadoRepositoryImpl(
      datasourceI
    );
    const controller = new EjercicioResultadoController(
      ejercicioResultadoRepositoryI
    );

    router.post("/register/", controller.registerEjercicio);
    router.get("/:id_paciente", controller.getEjercicio);

    return router;
  }
}
