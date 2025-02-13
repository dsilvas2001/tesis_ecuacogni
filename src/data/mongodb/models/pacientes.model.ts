import mongoose, { Schema } from "mongoose";

const pacienteSchema = new Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "ID de Usuario es requerido"],
    },
    edad: {
      type: Number,
      required: [true, "edad del paciente es requerido"],
    },
    genero: {
      type: String,
      required: [true, "Genero del paciente es requerido"],
      enum: {
        values: ["Masculino", "Femenino"],
        message: "El género debe ser 'Masculino' o 'Femenino'",
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

export const PacientesModel = mongoose.model("Paciente", pacienteSchema);
