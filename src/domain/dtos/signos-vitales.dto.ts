export class SignosVitalesDto {
  private constructor(
    public id_paciente?: string,
    public presion_arterial?: {
      sistolica: number;
      diastolica: number;
    },
    public frecuencia_cardiaca?: number,
    public frecuencia_respiratoria?: number,
    public temperatura?: number,
    public analisis_ia?: {
      prediccion?: string;
      recomendaciones?: string[];
      alertas?: string[];
      plan_accion?: string;
      tendencias?: string;
      reporte_medico_estructurado?: string;
      explicacion?: string;
    }
  ) {}

  static create(object: { [key: string]: any }): [string?, SignosVitalesDto?] {
    const {
      id_paciente,
      presion_arterial,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      analisis_ia,
    } = object;

    // Validaciones básicas
    if (!presion_arterial)
      return ["Los valores de presión arterial son requeridos"];
    if (!frecuencia_cardiaca) return ["La frecuencia cardíaca es requerida"];
    if (!frecuencia_respiratoria)
      return ["La frecuencia respiratoria es requerida"];
    if (!temperatura) return ["La temperatura es requerida"];

    // Validar estructura de presión arterial
    if (!presion_arterial.sistolica || !presion_arterial.diastolica) {
      return ["Los valores de presión arterial están incompletos"];
    }

    // Validar estructura de análisis de IA (si está presente)
    if (analisis_ia) {
      if (
        (analisis_ia.prediccion &&
          typeof analisis_ia.prediccion !== "string") ||
        (analisis_ia.recomendaciones &&
          !Array.isArray(analisis_ia.recomendaciones)) ||
        (analisis_ia.alertas && !Array.isArray(analisis_ia.alertas)) ||
        (analisis_ia.plan_accion &&
          typeof analisis_ia.plan_accion !== "string") ||
        (analisis_ia.tendencias &&
          typeof analisis_ia.tendencias !== "string") ||
        (analisis_ia.explicacion && typeof analisis_ia.explicacion !== "string")
      ) {
        return ["La estructura del análisis de IA es inválida"];
      }
    }

    return [
      undefined,
      new SignosVitalesDto(
        id_paciente,
        {
          sistolica: presion_arterial.sistolica,
          diastolica: presion_arterial.diastolica,
        },
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        analisis_ia
      ),
    ];
  }
}
