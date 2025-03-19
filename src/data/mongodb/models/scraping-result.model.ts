import mongoose, { Schema } from "mongoose";

const scrapingResultSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "El ID de la fuente es requerido"],
    },
    contenido: {
      type: Schema.Types.Mixed,
      required: [true, "El contenido obtenido del scraping es requerido"],
    },
    estado: {
      type: String,
      enum: ["exitoso", "fallido", "parcial"],
      required: [true, "El estado del scraping es requerido"],
    },
    error: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ScrapingResultModel = mongoose.model(
  "ScrapingResult",
  scrapingResultSchema
);
