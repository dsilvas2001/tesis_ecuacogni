import {
  CountResultPaciente,
  PacienteDatasource,
  PacienteDto,
  PacienteEntity,
  PacienteRepository,
} from "../../domain";

export class PacienteRepositoryImpl implements PacienteRepository {
  constructor(private readonly pacienteDatasource: PacienteDatasource) {}

  async register(pacienteDto: PacienteDto): Promise<PacienteEntity> {
    return this.pacienteDatasource.register(pacienteDto);
  }

  async findAll(centroId: string): Promise<PacienteEntity[]> {
    return this.pacienteDatasource.findAll(centroId);
  }

  async update(id: string, pacienteDto: PacienteDto): Promise<PacienteEntity> {
    return this.pacienteDatasource.update(id, pacienteDto);
  }

  async countAll(centroId: string): Promise<CountResultPaciente> {
    return this.pacienteDatasource.countAll(centroId);
  }

  async delete(id: string): Promise<string> {
    return this.pacienteDatasource.delete(id);
  }
}
