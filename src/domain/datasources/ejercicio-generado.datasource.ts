import { SignosVitalesDto } from "../dtos/signos-vitales.dto";

export abstract class EjercicioGeneradoDatasource {
  abstract generateEjercicio(
    categoria: string,
    numeroEjercicios: number,

    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]>;
}
