import { CentroDatasource, CentroRepository } from "../../domain";

export class CentroRepositoryImpl implements CentroRepository {
  constructor(private readonly centroDatasource: CentroDatasource) {}

  async crearCentro(crearCentroDto: any): Promise<any> {
    return this.centroDatasource.crearCentro(crearCentroDto);
  }
  async unirseCentro(unirseCentroDto: any): Promise<any> {
    return this.centroDatasource.unirseCentro(unirseCentroDto);
  }
}
