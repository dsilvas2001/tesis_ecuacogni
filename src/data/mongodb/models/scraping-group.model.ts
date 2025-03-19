import mongoose, { Schema } from "mongoose";

const scrapingGroupSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del grupo es requerido"],
    },
    descripcion: {
      type: String,
      default: "",
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

export const ScrapingGroupModel = mongoose.model(
  "ScrapingGroup",
  scrapingGroupSchema
);
