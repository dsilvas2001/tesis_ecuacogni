import mongoose, { Schema } from "mongoose";

const scrapingGroupItemSchema = new Schema(
  {
    id_grupo: {
      type: Schema.Types.ObjectId,
      ref: "ScrapingGroup",
      required: [true, "El ID del grupo es requerido"],
    },
    id_scraping: {
      type: Schema.Types.ObjectId,
      ref: "ScrapingResult",
      required: [true, "El ID del scraping individual es requerido"],
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

export const ScrapingGroupItemModel = mongoose.model(
  "ScrapingGroupItem",
  scrapingGroupItemSchema
);
