import mongoose, { Schema } from "mongoose";

const ejercicioSchema = new Schema(
  {
    id_prompt: {
      type: Schema.Types.ObjectId,
      ref: "PromptChatGPT",
      required: true,
    },
    categoria: {
      type: String,
      required: [true, "La categoría del ejercicio es requerida"],
      enum: ["Memoria", "Atencion", "Lenguaje", "Razonamiento"],
    },
    tipo: {
      type: String,
      required: [true, "El tipo de ejercicio es requerido"],
      enum: ["completar", "ordenar", "relacionar", "problema"], // Puedes agregar más tipos
    },
    titulo: {
      type: String,
      required: [true, "El título del ejercicio es requerido"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción del ejercicio es requerida"],
    },
    dificultad: {
      type: String,
      required: [true, "La dificultad del ejercicio es requerida"],
      enum: ["baja", "media", "alta"],
    },
    instrucciones: {
      type: String,
      required: [true, "Las instrucciones del ejercicio son requeridas"],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
  }
);
export const EjercicioGeneradoModel = mongoose.model(
  "EjercicioGenerado",
  ejercicioSchema
);
