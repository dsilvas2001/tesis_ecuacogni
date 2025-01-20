import mongoose, { Schema } from "mongoose";

const usuariosSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Nombre del usuario es requerido"],
    },
    apellido: {
      type: String,
      required: [true, "Apellido del usuario es requerido"],
    },
    email: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    id_rol: {
      type: Schema.Types.ObjectId,
      ref: "Rol",
      required: [true, "ID de Rol es requerido"],
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

export const UsuariosModel = mongoose.model("Usuarios", usuariosSchema);
