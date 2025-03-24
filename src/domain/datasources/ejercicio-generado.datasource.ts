import { SignosVitalesDto } from "../dtos/signos-vitales.dto";

export abstract class EjercicioGeneradoDatasource {
  abstract generateEjercicio(
    categoria: string,
    numeroEjercicios: number,

    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]>;

  abstract generateRecomendaciones(
    tendencia: string,
    porcentajeExito: number,
    tiempoTranscurrido: number
  ): Promise<any>;
}
