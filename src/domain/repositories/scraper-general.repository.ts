import { EjercicioDto } from "../dtos/ejercicios.dto";
import { EjercicioEntity } from "../entities/ejercicios.entity";

export abstract class ScraperGeneralRepository {
  // abstract register(ejercicioDto: EjercicioDto): Promise<EjercicioEntity>

  abstract getScraperGeneralJson(): Promise<EjercicioEntity[]>;
}
