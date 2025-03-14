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
    estadoEjercicio: "completo" | "incompleto" | "pendiente" | "todos"
  ): Promise<any[]> {
    return this.ejercicioPacienteDatasource.findAll(
      fechaSeleccionada,
      estadoEjercicio
    );
  }

  async countAll(): Promise<any> {
    return this.ejercicioPacienteDatasource.countAll();
  }

  async selectCategoria(signosVitalesDto: any): Promise<any> {
    return this.ejercicioPacienteDatasource.selectCategoria(signosVitalesDto);
  }
}
