import { PacienteDto } from "../dtos/paciente.dto";
import {
  CountResultPaciente,
  PacienteEntity,
} from "../entities/paciente.entity";

export abstract class PacienteRepository {
  abstract register(pacientedto: PacienteDto): Promise<PacienteEntity>;
  abstract findAll(centroId: string): Promise<PacienteEntity[]>;
  abstract update(
    id: string,
    pacientedto: PacienteDto
  ): Promise<PacienteEntity>;

  abstract countAll(centroId: string): Promise<CountResultPaciente>;

  abstract delete(id: string): Promise<string>;
}
