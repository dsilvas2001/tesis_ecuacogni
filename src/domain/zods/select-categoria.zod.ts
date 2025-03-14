import { z } from "zod";
export const SelectCategoriaZod = z.object({
  categoria: z.array(z.string()), // Ahora es un array de strings
  descripcion: z.string(), // Descripción con la justificación
});
