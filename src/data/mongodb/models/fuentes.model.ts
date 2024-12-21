import mongoose, { Schema } from "mongoose";
import { string } from "zod";

const fuenteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Nombre de la fuente es requerido"],
    },
    url: {
      type: String,
      required: [true, "URL de la fuente es requerida"],
    },
    autor: {
      type: String,
      required: [true, "El autor es requerido"],
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

export const FuenteModel = mongoose.model("Fuente", fuenteSchema);
