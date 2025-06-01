import {
  EjercicioResultadoDatasource,
  EjercicioResultadoRepository,
} from "../../domain";

export class EjercicioResultadoRepositoryImpl
  implements EjercicioResultadoRepository
{
  constructor(
    private readonly ejercicioResultadoDatasource: EjercicioResultadoDatasource
  ) {}

  async registerEjercicio(ejercicioResultado: any): Promise<any[]> {
    return this.ejercicioResultadoDatasource.registerEjercicio(
      ejercicioResultado
    );
  }

  async getEjercicio(id_paciente: any): Promise<any> {
    return this.ejercicioResultadoDatasource.getEjercicio(id_paciente);
  }
}
