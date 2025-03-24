import { Router } from "express";
import {
  EjercicioGeneradoDatasourceImpl,
  EjercicioGeneradoRepositoryImpl,
} from "../../infrastructure";
import { EjercicioGeneradoController } from "./ejercicio-generado.controller";

export class EjercicioGeneradoRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new EjercicioGeneradoDatasourceImpl();
    const pacienteEnrollmentRepositoryI = new EjercicioGeneradoRepositoryImpl(
      datasourceI
    );
    const controller = new EjercicioGeneradoController(
      pacienteEnrollmentRepositoryI
    );

    router.post(
      "/:categoria/:numeroEjercicios",
      controller.getEjercicioGenerado
    );

    router.post("/recomendaciones", controller.getRecomendaciones);

    return router;
  }
}
