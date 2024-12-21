import mongoose, { Schema } from "mongoose";

const medicosSchema = new Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "ID de Usuario es requerido"],
    },
    especialidad: {
      type: String,
      required: [true, "Especialidad del Medico es requerido"],
      default: "Cuidador",
    },
    experiencia_anios: {
      type: Number,
      required: [true, "Experiencia del Medico es requerido"],
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

export const MedicosModel = mongoose.model("Medicos", medicosSchema);