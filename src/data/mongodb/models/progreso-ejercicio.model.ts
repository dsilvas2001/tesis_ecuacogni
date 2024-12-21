import mongoose, { Schema } from "mongoose";
import { number } from "zod";

const progresoEjercicioSchema = new Schema(
  {
    id_relacion: {
      type: Schema.Types.ObjectId,
      ref: "Paciente_Ejercicio",
      required: [true, "ID de relación es requerido"],
    },
    tiempo_empleado: {
      type: Number,
      required: [true, "El tiempo empleado es requerido"],
    },
    respuestas: {
      type: Schema.Types.Mixed,
      required: [true, "Las respuestas son requeridas"],
    },
    puntaje_obtenido: {
      type: Number,
      required: [true, "El puntaje obtenido es requerido"],
    },
    porcentaje_acierto: {
      type: Number,
      required: [true, "El porcentaje de acierto es requerido"],
    },
    fecha_finalizacion: {
      type: Date,
      required: [true, "La fecha de finalización es requerida"],
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

export const ProgresoEjercicioSchemaModel = mongoose.model(
  "Progreso_Ejercicio",
  progresoEjercicioSchema
);
