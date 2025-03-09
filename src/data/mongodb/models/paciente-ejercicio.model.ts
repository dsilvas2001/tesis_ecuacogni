import mongoose, { Schema } from "mongoose";

const pacienteEjercicioschema = new Schema(
  {
    id_paciente: {
      type: Schema.Types.ObjectId,
      ref: "Paciente",
      required: [true, "ID de Paciente es requerido"],
    },
    id_ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: [true, "ID de Ejercicio es requerido"],
    },
    estado: {
      type: String,
      required: [true, "estado del ejercicio es requerido"],
      enum: ["incompleto", "completo"],
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

export const PacienteEjerciciosModel = mongoose.model(
  "Paciente_Ejercicios",
  pacienteEjercicioschema
);
