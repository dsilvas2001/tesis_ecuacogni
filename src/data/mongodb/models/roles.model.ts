import mongoose, { Schema } from "mongoose";

const rolesSchema = new Schema(
  {
    rolName: {
      type: String,
      required: [true, "Nombre del rol es requerido"],
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

export const RolesModel = mongoose.model("Roles", rolesSchema);
