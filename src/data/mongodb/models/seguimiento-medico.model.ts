import mongoose, { Schema } from "mongoose";

const seguimientoMedicoSchema = new Schema(
  {
    id_medico: {
      type: Schema.Types.ObjectId,
      ref: "Medico",
      required: [true, "ID del médico es requerido"],
    },
    id_paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: [true, "ID del paciente es requerido"],
    },
    id_progreso: {
      type: Schema.Types.ObjectId,
      ref: "Progreso_Ejercicio",
      required: false,
    },
    observaciones: {
      type: String,
      required: [true, "Las observaciones son requeridas"],
    },
    recomendaciones: {
      type: String,
      required: [true, "Las recomendaciones son requeridas"],
    },
    fecha_revision: {
      type: Date,
      default: Date.now,
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

export const SeguimientoMedicoModel = mongoose.model(
  "Seguimiento_Medico",
  seguimientoMedicoSchema
);
