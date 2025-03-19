import { SignosVitalesDto } from "../dtos/signos-vitales.dto";

export abstract class EjercicioGeneradoRepository {
  abstract generateEjercicio(
    categoria: string,
    numeroEjercicios: number,

    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]>;
}
