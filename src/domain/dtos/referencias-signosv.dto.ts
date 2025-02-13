export class ReferenciaSignosVDto {
  private constructor(
    public id_paciente?: string,
    public presion_arterial?: {
      sistolica_min: number;
      sistolica_max: number;
      diastolica_min: number;
      diastolica_max: number;
    },
    public frecuencia_cardiaca?: {
      min: number;
      max: number;
    },
    public frecuencia_respiratoria?: {
      min: number;
      max: number;
    },
    public temperatura?: {
      min: number;
      max: number;
    }
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, ReferenciaSignosVDto?] {
    const {
      id_paciente,
      presion_arterial,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
    } = object;

    // Validaciones básicas
    if (!presion_arterial)
      return ["Los valores de presión arterial son requeridos"];
    if (!frecuencia_cardiaca)
      return ["Los valores de frecuencia cardíaca son requeridos"];
    if (!frecuencia_respiratoria)
      return ["Los valores de frecuencia respiratoria son requeridos"];
    if (!temperatura) return ["Los valores de temperatura son requeridos"];

    // Validar estructura de presión arterial
    if (
      !presion_arterial.sistolica_min ||
      !presion_arterial.sistolica_max ||
      !presion_arterial.diastolica_min ||
      !presion_arterial.diastolica_max
    ) {
      return ["Los valores de presión arterial están incompletos"];
    }

    // Validar estructura de frecuencia cardíaca
    if (!frecuencia_cardiaca.min || !frecuencia_cardiaca.max) {
      return ["Los valores de frecuencia cardíaca están incompletos"];
    }

    // Validar estructura de frecuencia respiratoria
    if (!frecuencia_respiratoria.min || !frecuencia_respiratoria.max) {
      return ["Los valores de frecuencia respiratoria están incompletos"];
    }

    // Validar estructura de temperatura
    if (!temperatura.min || !temperatura.max) {
      return ["Los valores de temperatura están incompletos"];
    }

    return [
      undefined,
      new ReferenciaSignosVDto(
        id_paciente,
        {
          sistolica_min: presion_arterial.sistolica_min,
          sistolica_max: presion_arterial.sistolica_max,
          diastolica_min: presion_arterial.diastolica_min,
          diastolica_max: presion_arterial.diastolica_max,
        },
        {
          min: frecuencia_cardiaca.min,
          max: frecuencia_cardiaca.max,
        },
        {
          min: frecuencia_respiratoria.min,
          max: frecuencia_respiratoria.max,
        },
        {
          min: temperatura.min,
          max: temperatura.max,
        }
      ),
    ];
  }
}
