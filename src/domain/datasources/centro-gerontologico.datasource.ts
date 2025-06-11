import {
  CrearCentroDto,
  UnirseCentroDto,
} from "../dtos/centro-gerontologico.dto";

export abstract class CentroDatasource {
  abstract crearCentro(crearCentroDto: CrearCentroDto): Promise<any>;
  abstract unirseCentro(unirseCentroDto: UnirseCentroDto): Promise<any>;
}
