import { z } from "zod";

export const EjercicioZod = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  duracion: z.number(),
  dificultad: z.string(),
});
