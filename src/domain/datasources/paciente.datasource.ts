import { PacienteDto } from "../dtos/paciente.dto";
import {
  CountResultPaciente,
  PacienteEntity,
} from "../entities/paciente.entity";

export abstract class PacienteDatasource {
  abstract register(pacientedto: PacienteDto): Promise<PacienteEntity>;

  abstract findAll(): Promise<PacienteEntity[]>;

  abstract update(
    id: string,
    pacientedto: PacienteDto
  ): Promise<PacienteEntity>;

  abstract countAll(): Promise<CountResultPaciente>;
  abstract delete(id: string): Promise<string>;
}
