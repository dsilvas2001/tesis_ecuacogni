import { SignosVitalesDto } from "../dtos/signos-vitales.dto";
import { EjercicioPacienteRepository } from "../repositories/ejercicio-paciente.repository";

export class EjercicioPacienteUseCase {
  constructor(
    private readonly ejercicioPacienteRepository: EjercicioPacienteRepository
  ) {}

  async executeAll(
    fechaSeleccionada: string,
    statusSV: "completo" | "incompleto" | "pendiente" | "todos",
    centroId: string
  ) {
    return await this.ejercicioPacienteRepository.findAll(
      fechaSeleccionada,
      statusSV,
      centroId
    );
  }
  async executeCount(centroId: string) {
    return await this.ejercicioPacienteRepository.countAll(centroId);
  }
  async executeSelectCaregoria(signosVitalesDto: SignosVitalesDto) {
    return await this.ejercicioPacienteRepository.selectCategoria(
      signosVitalesDto
    );
  }
}
