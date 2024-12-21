import mongoose, { Schema } from "mongoose";

const ejercicioSchema = new Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es requerido"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripcion es requerida"],
    },
    duracion: {
      type: Number,
      required: [true, "La duracion es requerida"],
    },
    dificultad: {
      type: String,
      required: [true, "La dificultad es requerida"],
    },
    id_categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },

    id_fuente: {
      type: Schema.Types.ObjectId,
      ref: "Fuente",
      required: [true, "ID de fuente es requerido"],
    },
    fecha_extraccion: {
      type: Date,
      default: Date.now,
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

export const EjercicioModel = mongoose.model("Ejercicio", ejercicioSchema);
