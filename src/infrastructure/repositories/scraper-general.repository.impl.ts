import {
  EjercicioEntity,
  ScraperGeneralDatasource,
  ScraperGeneralRepository,
} from "../../domain";

export class ScraperGeneralRepositoryImpl implements ScraperGeneralRepository {
  constructor(
    private readonly scraperGeneralDatasource: ScraperGeneralDatasource
  ) {}

  async getScraperGeneralJson(): Promise<EjercicioEntity[]> {
    return this.scraperGeneralDatasource.getScraperGeneralJson();
  }
}
