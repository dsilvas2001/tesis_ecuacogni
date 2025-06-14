import { SignosVitalesDto } from "../dtos/signos-vitales.dto";
import { SignosVitalesRepository } from "../repositories/signos-vitales.repository";

export class SignosVitalesUseCase {
  constructor(
    private readonly signosVitalesRepository: SignosVitalesRepository
  ) {}

  async execute(signosVitalesDto: SignosVitalesDto): Promise<any> {
    const signos_vitales = await this.signosVitalesRepository.register(
      signosVitalesDto
    );

    return signos_vitales;
  }

  async executeUpdate(
    id_paciente: string,
    fecha: string,
    signosVitalesDto: SignosVitalesDto
  ) {
    return await this.signosVitalesRepository.update(
      id_paciente,
      fecha,
      signosVitalesDto
    );
  }

  async executeAll(
    fechaSeleccionada: string,
    statusSV: string,
    centroId: string
  ) {
    return await this.signosVitalesRepository.findAll(
      fechaSeleccionada,
      statusSV,
      centroId
    );
  }

  async executeCountAll(fechaString: string, centroId: string) {
    return await this.signosVitalesRepository.countAll(fechaString, centroId);
  }

  async executeDelete(id_paciente: string, fecha: string) {
    return await this.signosVitalesRepository.delete(id_paciente, fecha);
  }

  async executeFindByPacienteAndFecha(id_paciente: string, fecha: string) {
    return await this.signosVitalesRepository.findByPacienteAndFecha(
      id_paciente,
      fecha
    );
  }
}
