import { FuentesEntity } from "../entities/fuentes.entity";

export abstract class FuentesRepository {
  abstract getFuentesJson(): Promise<FuentesEntity[]>;
}
