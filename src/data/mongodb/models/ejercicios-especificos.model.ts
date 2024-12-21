import mongoose, { Schema } from "mongoose";

const ejercicioEspecificoSchema = new Schema(
  {
    id_ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: [true, "ID del ejercicio es requerido"],
    },
    condicion_especifica: {
      type: String,
      required: [true, "La condición es requerida"],
    },
    signo_vital_relevante: {
      type: String,
      required: [true, "El signo vital relevante es requerido"],
    },
    rango_ideal: {
      type: String,
      required: [true, "El rango ideal es requerido"],
    },
    recomendaciones: {
      type: String,
      required: [true, "Las recomendaciones son requeridas"],
    },
    observaciones: {
      type: String,
      required: [true, "Las observaciones son requeridas"],
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

export const EjercicioEspecificoModel = mongoose.model(
  "EjercicioEspecifico",
  ejercicioEspecificoSchema
);
