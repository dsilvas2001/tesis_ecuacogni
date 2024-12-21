import { CategoriasRepository } from "../repositories/categorias.repository";

export class CategoriasUseCase {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  async execute() {
    return await this.categoriasRepository.getCategoriasJson();
  }
}
