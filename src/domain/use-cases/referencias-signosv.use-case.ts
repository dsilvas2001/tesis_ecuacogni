import { ReferenciaSignosVDto } from "../dtos/referencias-signosv.dto";
import { ReferenciaSignosVRepository } from "../repositories/referencias-signosv.repository";

export class ReferenciaSignosVUseCase {
  constructor(
    private readonly referenciaSignosVRepository: ReferenciaSignosVRepository
  ) {}

  async execute(referenciaSignosVDto: ReferenciaSignosVDto): Promise<any> {
    const referenciaSignosV = await this.referenciaSignosVRepository.register(
      referenciaSignosVDto
    );

    return referenciaSignosV;
  }
  async executeUpdate(
    id_paciente: string,
    referenciaSignosVDto: ReferenciaSignosVDto
  ) {
    return await this.referenciaSignosVRepository.update(
      id_paciente,
      referenciaSignosVDto
    );
  }

  async executeAll(centroId: string) {
    return await this.referenciaSignosVRepository.findAll(centroId);
  }

  async executeCount(centroId: string) {
    return await this.referenciaSignosVRepository.countAll(centroId);
  }

  async executeNotReferenciaSignosV(centroId: string) {
    return await this.referenciaSignosVRepository.findNotReferenciaSignosV(
      centroId
    );
  }

  async executeDelete(id_paciente: string) {
    return await this.referenciaSignosVRepository.delete(id_paciente);
  }
}
