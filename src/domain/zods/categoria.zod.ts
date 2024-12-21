import { z } from "zod";

export const CategoriaZod = z.object({
  nombre: z.string(),
  descripcion: z.string(),
});
