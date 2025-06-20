import { Router } from "express";
import {
  SignosVitalesDatasourceImpl,
  SignosVitalesRepositoryImpl,
} from "../../infrastructure";
import { SignosVitalesController } from "./signos-vitales.controller";
//

export class SignosVitalesRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new SignosVitalesDatasourceImpl();
    const pacienteEnrollmentRepositoryI = new SignosVitalesRepositoryImpl(
      datasourceI
    );
    const controller = new SignosVitalesController(
      pacienteEnrollmentRepositoryI
    );

    router.get("/pacienteSV/:id/:fecha", controller.findByPacienteAndFecha);
    router.get("/:fecha/:status/:centroId", controller.getAllSignosV);
    router.post("/register", controller.registerSignosVitales);
    router.put("/update/:id/:fecha", controller.updateSignosV);
    router.put("/delete/:id/:fecha", controller.deleteSignosV);

    router.get("/count/:status/:fecha/:centroId", controller.countgetSignosV);

    return router;
  }
}
