import mongoose, { Schema } from "mongoose";

const EjercicioResultadosSchema = new Schema(
  {
    paciente: {
      id_paciente: { type: String, required: true },
      nombre: String,
      apellido: String,
      edad: Number,
    },
    ejercicios: [
      {
        titulo: String,
        descripcion: String,
        tipo: String,
        dificultad: String,
        instrucciones: String,
        contenido: {
          tipo_contenido: String,
          contenido: String,
          opciones: [
            {
              texto: String,
              imagen: String,
            },
          ],
          respuesta_correcta: [String],
        },
        ajustesNecesarios: String,
        calidad: Number,
        estado: String,
        resultado: {
          intentos: Number,
          errores: Number,
        },
      },
    ],
    resumen: {
      total_ejercicios: Number,
      total_errores: Number,
      tiempo_total_formateado: String,
    },
  },
  {
    timestamps: true,
  }
);

export const EjercicioResultadosModel = mongoose.model(
  "EjercicioResultados",
  EjercicioResultadosSchema
);
