import mongoose, { Schema } from "mongoose";

const signosVitalesSchema = new Schema(
  {
    id_paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: [true, "ID del paciente es requerido"],
    },
    presion_arterial: {
      type: String,
      required: [true, "Presión arterial es requerida"],
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
