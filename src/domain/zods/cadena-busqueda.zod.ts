import { z } from "zod";

export const CadenaBusquedaZod = z.object({
  cadena: z.string(),
});
