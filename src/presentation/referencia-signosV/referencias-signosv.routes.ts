import { Router } from "express";
import {
  ReferenciaSignosVDatasourceImpl,
  ReferenciaSignosVRepositoryImpl,
} from "../../infrastructure";
import { ReferenciaSignosVController } from "./referencias-signosv.controller";

export class ReferenciaSignosVRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new ReferenciaSignosVDatasourceImpl();
    const pacienteEnrollmentRepositoryI = new ReferenciaSignosVRepositoryImpl(
      datasourceI
    );
    const controller = new ReferenciaSignosVController(
      pacienteEnrollmentRepositoryI
    );

    router.post("/register", controller.registerReferenciaSignosV);
    router.put("/update/:id", controller.updateReferenciaSignosV);
    router.get("/", controller.getAllReferenciaSignosV);
    router.get("/notreferencia/", controller.getNotReferenciaSignosV);

    router.get("/count/", controller.getCountReferenciaSignosV);

    router.put("/delete/:id", controller.deleteReferenciaSignosV);

    return router;
  }
}
