import { get } from "http";
import { Router } from "express";
import { EjercicioPacienteDatasourceImpl } from "../../infrastructure/datasources/ejercicio-paciente.datasource.impl";
import { EjercicioPacienteRepositoryImpl } from "../../infrastructure/repositories/ejercicio-paciente.repository.impl";
import { EjercicioPacienteController } from "./ejercicio-paciente.controller";

export class EjercicioPacienteRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new EjercicioPacienteDatasourceImpl();
    const pacienteEnrollmentRepositoryI = new EjercicioPacienteRepositoryImpl(
      datasourceI
    );
    const controller = new EjercicioPacienteController(
      pacienteEnrollmentRepositoryI
    );

    router.get("/:fecha/:status", controller.getEjercicio);
    router.get("/count", controller.getCountEjercicio);

    return router;
  }
}
