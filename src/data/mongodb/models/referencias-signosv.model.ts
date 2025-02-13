import mongoose, { Schema } from "mongoose";

const referenciaSignosVitalesSchema = new Schema(
  {
    id_paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: [true, "ID del paciente es requerido"],
    },
    presion_arterial: {
      sistolica_min: {
        type: Number,
        required: [true, "Límite inferior de presión sistólica es requerido"],
      },
      sistolica_max: {
        type: Number,
        required: [true, "Límite superior de presión sistólica es requerido"],
      },
      diastolica_min: {
        type: Number,
        required: [true, "Límite inferior de presión diastólica es requerido"],
      },
      diastolica_max: {
        type: Number,
        required: [true, "Límite superior de presión diastólica es requerido"],
      },
    },
    frecuencia_cardiaca: {
      min: {
        type: Number,
        required: [true, "Límite inferior de frecuencia cardíaca es requerido"],
      },
      max: {
        type: Number,
        required: [true, "Límite superior de frecuencia cardíaca es requerido"],
      },
    },
    frecuencia_respiratoria: {
      min: {
        type: Number,
        required: [
          true,
          "Límite inferior de frecuencia respiratoria es requerido",
        ],
      },
      max: {
        type: Number,
        required: [
          true,
          "Límite superior de frecuencia respiratoria es requerido",
        ],
      },
    },
    temperatura: {
      min: {
        type: Number,
        required: [true, "Límite inferior de temperatura es requerido"],
      },
      max: {
        type: Number,
        required: [true, "Límite superior de temperatura es requerido"],
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

export const ReferenciaSignosVitalesModel = mongoose.model(
  "ReferenciaSignosVitales",
  referenciaSignosVitalesSchema
);
