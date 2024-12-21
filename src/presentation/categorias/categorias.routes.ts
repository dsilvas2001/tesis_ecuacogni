import { Router } from "express";
import {
  CategoriasDatasourceImpl,
  CategoriasRepositoryImpl,
} from "../../infrastructure";
import { CategoriasController } from "./categorias.controller";

export class CategoriasRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new CategoriasDatasourceImpl();
    const categoriasRepositoryI = new CategoriasRepositoryImpl(datasourceI);
    const controller = new CategoriasController(categoriasRepositoryI);

    router.get("/", controller.getCategorias);

    return router;
  }
}
