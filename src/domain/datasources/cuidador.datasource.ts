export abstract class CuidadorDatasource {
  abstract countCuidadoresPorEstado(centroId: string): Promise<{
    aprobados: number;
    noAprobados: number;
  }>;

  abstract findAprobadosCuidadores(centroId: string): Promise<any[]>;
  abstract findNoAprobadosCuidadores(centroId: string): Promise<any[]>;
  abstract aprobarCuidador(cuidadorId: string): Promise<boolean>;
}
