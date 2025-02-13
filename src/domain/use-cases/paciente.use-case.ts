import { PacienteDto } from "../dtos/paciente.dto";
import { PacienteRepository } from "../repositories/paciente.repository";

export class PacienteUseCase {
  constructor(private readonly pacienteRepository: PacienteRepository) {}

  async execute(userDto: PacienteDto): Promise<any> {
    const paciente = await this.pacienteRepository.register(userDto);

    return paciente;
  }
  async executeAll() {
    return await this.pacienteRepository.findAll();
  }
  async executeCount() {
    return await this.pacienteRepository.countAll();
  }
  async executeUpdate(id: string, userDto: PacienteDto) {
    return await this.pacienteRepository.update(id, userDto);
  }
  async executeDelete(id: string) {
    return await this.pacienteRepository.delete(id);
  }
}
