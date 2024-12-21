import { Router } from "express";
import {
  ScraperGeneralDatasourceImpl,
  ScraperGeneralRepositoryImpl,
} from "../../infrastructure";
import { ScraperGeneralController } from "./scraper-general.controller";

export class ScraperGeneralRoutes {
  static get routes(): Router {
    const router = Router();
    const datasourceI = new ScraperGeneralDatasourceImpl();
    const fuentesRepositoryI = new ScraperGeneralRepositoryImpl(datasourceI);
    const controller = new ScraperGeneralController(fuentesRepositoryI);

    router.get("/", controller.getScraperGeneral);
    return router;
    //
  }
}
