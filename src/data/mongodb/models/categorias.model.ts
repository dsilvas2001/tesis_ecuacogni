import mongoose, { Schema } from "mongoose";

const categoriaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Nombre de la categoría es requerido"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripcion es requerida"],
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

export const CategoriaModel = mongoose.model("Categoria", categoriaSchema);
