import {
  FuentesDatasource,
  FuentesEntity,
  FuentesRepository,
} from "../../domain";

export class FuentesRepositoryImpl implements FuentesRepository {
  constructor(private readonly fuentesDatasource: FuentesDatasource) {}

  async getFuentesJson(): Promise<FuentesEntity[]> {
    return this.fuentesDatasource.getFuentesJson();
  }
}
