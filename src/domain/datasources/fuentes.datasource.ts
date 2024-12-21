import { FuentesDto } from "../dtos/fuentes.dto";
import { FuentesEntity } from "../entities/fuentes.entity";

export abstract class FuentesDatasource {
  abstract getFuentesJson(): Promise<FuentesEntity[]>;
}
