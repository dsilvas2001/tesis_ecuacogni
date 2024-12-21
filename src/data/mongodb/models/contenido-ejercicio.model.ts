import mongoose, { Schema } from "mongoose";

const contenidoEjercicioSchema = new Schema(
  {
    id_ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: [true, "El ID del ejercicio es requerido"],
    },
    tipo_contenido: {
      type: String,
      enum: ["opción", "respuesta"],
      required: [true, "El tipo de contenido es requerido"],
    },
    detalle_contenido: {
      type: String,
      required: [true, "El detalle del contenido es requerido"],
    },
  },
  {
    timestamps: true,
  }
);

const ContenidoEjercicioModel = mongoose.model(
  "Contenido_Ejercicio",
  contenidoEjercicioSchema
);

module.exports = ContenidoEjercicioModel;
