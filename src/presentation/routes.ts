import { Router } from "express";
import { FuentesRoutes } from "./fuentes/fuentes.routes";
import { CategoriasRoutes } from "./categorias/categorias.routes";
import { ScraperGeneralRoutes } from "./scraper-general/scraper-general.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/fuentes", FuentesRoutes.routes);
    router.use("/categorias", CategoriasRoutes.routes);
    router.use("/ejercicio", ScraperGeneralRoutes.routes);

    return router;
  }
}
