import mongoose, { Schema } from "mongoose";

const centroGerontologicoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Nombre del centro es requerido"],
    },
    direccion: {
      type: String,
      required: [true, "Dirección del centro es requerida"],
    },
    codigo_unico: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    id_administrador: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      unique: true,
      required: true,
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

export const CentroGerontologicoModel = mongoose.model(
  "CentroGerontologico",
  centroGerontologicoSchema
);
