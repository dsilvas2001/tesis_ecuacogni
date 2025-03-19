import {
  EjercicioGeneradoDatasource,
  EjercicioGeneradoRepository,
  SignosVitalesDto,
} from "../../domain";

export class EjercicioGeneradoRepositoryImpl
  implements EjercicioGeneradoRepository
{
  constructor(
    private ejercicioGeneradoDatasource: EjercicioGeneradoDatasource
  ) {}

  async generateEjercicio(
    categoria: string,
    numeroEjercicios: number,

    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]> {
    return this.ejercicioGeneradoDatasource.generateEjercicio(
      categoria,
      numeroEjercicios,
      signosVitalesDto
    );
  }
}
