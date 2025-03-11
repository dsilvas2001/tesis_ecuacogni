import { EjercicioPacienteRepository } from "../repositories/ejercicio-paciente.repository";

export class EjercicioPacienteUseCase {
  constructor(
    private readonly ejercicioPacienteRepository: EjercicioPacienteRepository
  ) {}

  async executeAll(
    fechaSeleccionada: string,
    statusSV: "completo" | "incompleto" | "pendiente" | "todos"
  ) {
    return await this.ejercicioPacienteRepository.findAll(
      fechaSeleccionada,
      statusSV
    );
  }
  async executeCount() {
    return await this.ejercicioPacienteRepository.countAll();
  }
}
