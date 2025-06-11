import { SignosVitalesDto } from "../dtos/signos-vitales.dto";
import {
  CountResultSignosV,
  SignosVitalesEntity,
} from "../entities/signos-vitales.entity";

export abstract class SignosVitalesRepository {
  abstract register(
    signosVitalesDto: SignosVitalesDto
  ): Promise<SignosVitalesEntity>;

  abstract findAll(
    fechaSeleccionada: string,
    statusSV: string,
    centroId: string
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

  abstract countAll(
    fecha: string,
    centroId: string
  ): Promise<CountResultSignosV>;

  abstract delete(id_paciente: string, fecha: string): Promise<string>;
}
