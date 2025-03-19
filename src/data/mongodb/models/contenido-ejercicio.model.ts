import mongoose, { Schema } from "mongoose";

const contenidoEjercicioSchema = new Schema(
  {
    ejercicio_id: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: [true, "El ID del ejercicio es requerido"],
    },
    tipo_contenido: {
      type: String,
      required: [true, "El tipo de contenido es requerido"],
      enum: ["texto", "imagen", "audio"], // Puedes agregar más tipos de contenido
    },
    contenido: {
      type: String,
      required: [true, "El contenido del ejercicio es requerido"],
    },
    opciones: {
      type: [String], // Array de opciones (para ejercicios de selección múltiple)
      default: null,
    },
    respuesta_correcta: {
      type: [String],
      required: [true, "La respuesta correcta es requerida"],
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
export const ContenidoEjercicioModel = mongoose.model(
  "Contenido_Ejercicio",
  contenidoEjercicioSchema
);
