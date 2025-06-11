export abstract class CentroRepository {
  abstract crearCentro(crearCentroDto: any): Promise<any>;
  abstract unirseCentro(unirseCentroDto: any): Promise<any>;
}
