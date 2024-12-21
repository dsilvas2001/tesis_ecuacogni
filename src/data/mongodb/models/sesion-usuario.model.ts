import mongoose, { Schema } from "mongoose";

const sesionUsuarioSchema = new Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "ID de Usuario es requerido"],
    },
    inicio_sesion: {
      type: Date,
      default: Date.now,
    },
    fin_sesion: {
      type: Date,
      required: [true, "fin_sesion del Usuario es requerido"],
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

export const SesionUsuarioModel = mongoose.model(
  "Sesion_Usuario",
  sesionUsuarioSchema
);
