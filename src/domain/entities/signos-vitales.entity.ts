export class SignosVitalesEntity {
  constructor(
    public id?: string,
    public id_paciente?: string,
    public presion_arterial?: {
      sistolica: number;
      diastolica: number;
    },
    public frecuencia_cardiaca?: number,
    public frecuencia_respiratoria?: number,
    public temperatura?: number,
    public analisis_ia?: {
      prediccion?: string; // "normal", "anomalía", "riesgo", etc.
      recomendaciones?: string[];
      alertas?: string[];
      plan_accion?: string;
      tendencias?: string;
      reporte_medico_estructurado?: string;
      explicacion?: string;
    },
    public deletedAt?: Date,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
