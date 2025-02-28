import {
  SignosVitalesDatasource,
  SignosVitalesDto,
  SignosVitalesEntity,
  SignosVitalesRepository,
} from "../../domain";

export class SignosVitalesRepositoryImpl implements SignosVitalesRepository {
  constructor(
    private readonly signosVitalesDatasource: SignosVitalesDatasource
  ) {}

  async register(userDto: SignosVitalesDto): Promise<SignosVitalesEntity> {
    return this.signosVitalesDatasource.register(userDto);
  }

  async update(
    id_paciente: string,
    fecha: string,
    signosVitalesDto: SignosVitalesDto
  ): Promise<SignosVitalesEntity> {
    return this.signosVitalesDatasource.update(
      id_paciente,
      fecha,
      signosVitalesDto
    );
  }

  async findAll(
    fechaSeleccionada: string,
    statusSV: string
  ): Promise<SignosVitalesEntity[]> {
    return this.signosVitalesDatasource.findAll(fechaSeleccionada, statusSV);
  }

  async findByPacienteAndFecha(
    id_paciente: string,
    fecha: string
  ): Promise<SignosVitalesEntity> {
    return this.signosVitalesDatasource.findByPacienteAndFecha(
      id_paciente,
      fecha
    );
  }
}
