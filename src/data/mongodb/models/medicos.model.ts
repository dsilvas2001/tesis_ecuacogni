import mongoose, { Schema } from "mongoose";

const medicosSchema = new Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "ID de Usuario es requerido"],
    },
    experiencia_anios: {
      type: Number,
      required: [true, "Experiencia del Medico es requerido"],
    },
    aprobado: {
      type: Boolean,
      default: false,
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
