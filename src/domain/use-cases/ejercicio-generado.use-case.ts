import { SignosVitalesDto } from "../dtos/signos-vitales.dto";
import { EjercicioGeneradoRepository } from "../repositories/ejercicio-generado.repository";

export class EjercicioGeneradoUseCase {
  constructor(
    private readonly ejercicioGeneradoRepository: EjercicioGeneradoRepository
  ) {}

  async executeEjercicio(
    categoria: string,
    numeroEjercicios: number,

    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]> {
    const ejercicio = await this.ejercicioGeneradoRepository.generateEjercicio(
      categoria,
      numeroEjercicios,

      signosVitalesDto
    );

    return ejercicio;
  }
}
