import { EjercicioDto } from "../dtos/ejercicios.dto";
import { EjercicioEntity } from "../entities/ejercicios.entity";

export abstract class ScraperGeneralDatasource {
  // abstract register(ejercicioDto: EjercicioDto): Promise<EjercicioEntity>;
  abstract getScraperGeneralJson(): Promise<EjercicioEntity[]>;
}
