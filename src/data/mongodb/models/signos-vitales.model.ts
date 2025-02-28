import mongoose, { Schema } from "mongoose";

const signosVitalesSchema = new Schema(
  {
    id_paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: [true, "ID del paciente es requerido"],
    },
    presion_arterial: {
      sistolica: {
        type: Number,
        required: [true, "Presión sistólica es requerida"],
      },
      diastolica: {
        type: Number,
        required: [true, "Presión diastólica es requerida"],
      },
    },
    frecuencia_cardiaca: {
      type: Number,
      required: [true, "Frecuencia cardíaca es requerida"],
    },
    frecuencia_respiratoria: {
      type: Number,
      required: [true, "Frecuencia respiratoria es requerida"],
    },
    temperatura: {
      type: Number,
      required: [true, "Temperatura es requerida"],
    },
    // Campos avanzados para integración con IA
    analisis_ia: {
      // Predicciones o resultados generados por la IA
      prediccion: {
        type: String,
        default: null,
      },
      recomendaciones: {
        type: [String], // Un array de recomendaciones personalizadas
        default: [],
      },
      alertas: {
        type: [String], // Un array de alertas generadas por la IA
        default: [],
      },
      // Nuevo campo: Plan de acción generado por la IA
      plan_accion: {
        type: String, // Un plan personalizado para el paciente
        default: null,
      },
      // Nuevo campo: Análisis de tendencias (por ejemplo, "La presión arterial ha aumentado en los últimos 7 días")
      tendencias: {
        type: String,
        default: null,
      },
      // Nuevo campo: Puntuación de salud general generada por la IA
      reporte_medico_estructurado: {
        type: String,
        default: null,
      },
      // Nuevo campo: Explicación detallada de la predicción (generada por la IA)
      explicacion: {
        type: String,
        default: null,
      },
      statusSV: {
        type: String,
        value: ["emergencia", "estable"],
      },
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
export const SignosVitalesModel = mongoose.model(
  "Signos_Vitales",
  signosVitalesSchema
);
