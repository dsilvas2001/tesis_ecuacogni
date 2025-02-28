import { SignosVitalesDto } from "../dtos/signos-vitales.dto";
import { SignosVitalesEntity } from "../entities/signos-vitales.entity";

export abstract class SignosVitalesRepository {
  abstract register(
    signosVitalesDto: SignosVitalesDto
  ): Promise<SignosVitalesEntity>;

  abstract findAll(
    fechaSeleccionada: string,
    statusSV: string
  ): Promise<SignosVitalesEntity[]>;

  abstract update(
    id_paciente: string,
    fecha: string,
    signosVitalesDto: SignosVitalesDto
  ): Promise<SignosVitalesEntity>;

  abstract findByPacienteAndFecha(
    id_paciente: string,
    fecha: string
  ): Promise<SignosVitalesEntity>;

  // abstract delete(id_paciente: string): Promise<string>;
}
