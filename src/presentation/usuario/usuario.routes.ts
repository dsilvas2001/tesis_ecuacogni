import { Router } from "express";
import {
  UsuarioDatasourceImpl,
  UsuarioRepositoryImpl,
} from "../../infrastructure";
import { UsuarioController } from "./usuario.controller";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new UsuarioDatasourceImpl();
    const studentEnrollmentRepositoryI = new UsuarioRepositoryImpl(datasourceI);
    const controller = new UsuarioController(studentEnrollmentRepositoryI);

    router.post("/register", controller.registerUser);
    router.post("/auth", controller.findByCredentials);
    router.get("/countHome", controller.getCountAllHOME);

    // router.post("/register", controller.registerUser);

    return router;
  }
}
