import { Router } from "express";
import {
  PacienteDatasourceImpl,
  PacienteRepositoryImpl,
} from "../../infrastructure";
import { PacienteController } from "./paciente.controller";

export class PacienteRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new PacienteDatasourceImpl();
    const pacienteEnrollmentRepositoryI = new PacienteRepositoryImpl(
      datasourceI
    );
    const controller = new PacienteController(pacienteEnrollmentRepositoryI);

    router.post("/register", controller.registerPaciente);

    router.get("/", controller.getAllPaciente);
    router.get("/count", controller.countAllPaciente);

    router.put("/update/:id", controller.updatePaciente);
    router.put("/delete/:id", controller.deletePaciente);

    return router;
  }
}
