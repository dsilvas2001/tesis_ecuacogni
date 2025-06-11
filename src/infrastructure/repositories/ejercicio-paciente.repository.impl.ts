import {
  EjercicioPacienteDataSource,
  EjercicioPacienteRepository,
} from "../../domain";

export class EjercicioPacienteRepositoryImpl
  implements EjercicioPacienteRepository
{
  constructor(
    private readonly ejercicioPacienteDatasource: EjercicioPacienteDataSource
  ) {}

  async findAll(
    fechaSeleccionada: string,
    estadoEjercicio: "completo" | "incompleto" | "pendiente" | "todos",
    centroId: string
  ): Promise<any[]> {
    return this.ejercicioPacienteDatasource.findAll(
      fechaSeleccionada,
      estadoEjercicio,
      centroId
    );
  }

  async countAll(centroId: string): Promise<any> {
    return this.ejercicioPacienteDatasource.countAll(centroId);
  }

  async selectCategoria(signosVitalesDto: any): Promise<any> {
    return this.ejercicioPacienteDatasource.selectCategoria(signosVitalesDto);
  }
}
