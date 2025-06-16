import { CuidadorDatasource, CuidadorRepository } from "../../domain";

export class CuidadorRepositoryImpl implements CuidadorRepository {
  constructor(private readonly datasource: CuidadorDatasource) {}

  async countCuidadoresPorEstado(centroId: string): Promise<{
    aprobados: number;
    noAprobados: number;
  }> {
    return this.datasource.countCuidadoresPorEstado(centroId);
  }

  async findAprobadosCuidadores(centroId: string): Promise<any[]> {
    return this.datasource.findAprobadosCuidadores(centroId);
  }

  async findNoAprobadosCuidadores(centroId: string): Promise<any[]> {
    return this.datasource.findNoAprobadosCuidadores(centroId);
  }

  async aprobarCuidador(cuidadorId: string): Promise<boolean> {
    return this.datasource.aprobarCuidador(cuidadorId);
  }
}
