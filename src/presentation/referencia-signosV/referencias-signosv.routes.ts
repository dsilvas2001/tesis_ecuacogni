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
    router.get("/:centroId", controller.getAllReferenciaSignosV);
    router.get("/notreferencia/:centroId", controller.getNotReferenciaSignosV);

    router.get("/count/:centroId", controller.getCountReferenciaSignosV);

    router.put("/delete/:id", controller.deleteReferenciaSignosV);

    return router;
  }
}
