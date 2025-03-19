import { z } from "zod";

// Esquema para el contenido adicional del ejercicio
export const ContenidoEjercicioZod = z.object({
  tipo_contenido: z.enum(["texto", "imagen", "audio"]), // Tipos de contenido permitidos
  contenido: z.string(), // El contenido en sí (texto, URL de imagen, etc.)
  opciones: z.array(
    z.object({
      texto: z.string(),
      imagen: z.string().optional(),
    })
  ),
  respuesta_correcta: z.array(z.string()), // Respuesta correcta para validar el ejercicio
});

// Esquema para un ejercicio individual
export const EjercicioGeneradoZod = z.object({
  titulo: z.string(), // Título del ejercicio
  descripcion: z.string(), // Descripción breve del ejercicio
  tipo: z.enum(["completar", "ordenar", "relacionar", "problema"]), // Tipo de ejercicio
  dificultad: z.enum(["baja", "media", "alta"]), // Nivel de dificultad
  instrucciones: z.string(), // Instrucciones detalladas para resolver el ejercicio
  contenido: ContenidoEjercicioZod, // Contenido adicional (opcional)
});
