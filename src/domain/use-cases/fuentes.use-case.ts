import { FuentesRepository } from "../repositories/fuentes.repository";

export class FuentesUseCase {
  constructor(private readonly fuentesRepository: FuentesRepository) {}

  async execute() {
    return await this.fuentesRepository.getFuentesJson();
  }
}
