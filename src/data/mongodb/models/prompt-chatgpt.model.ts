import mongoose, { Schema } from "mongoose";

const promptChatGPTSchema = new Schema(
  {
    texto: {
      type: String,
      required: [true, "El texto del prompt es requerido"],
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

export const PromptChatGPTModel = mongoose.model(
  "PromptChatGPT",
  promptChatGPTSchema
);
