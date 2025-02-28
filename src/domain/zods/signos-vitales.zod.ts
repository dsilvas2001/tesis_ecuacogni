import { z } from "zod";

export const SignosVitalesZod = z.object({
  pacientes: z.object({
    _id: z.string(),
    nombre: z.string(),
    apellido: z.string(),

    edad: z.number(),
  }),
  presion_arterial: z.object({
    sistolica: z.number(),
    diastolica: z.number(),
  }),
  frecuencia_cardiaca: z.number(),
  frecuencia_respiratoria: z.number(),
  temperatura: z.number(),

  analisis_ia: z.object({
    prediccion: z.string().nullable(),
    recomendaciones: z.array(z.string()),
    alertas: z.array(z.string()),
    plan_accion: z.string(),
    tendencias: z.string(),
    reporte_medico_estructurado: z.string(),
    explicacion: z.string(),
    statusSV: z.enum(["emergencia", "estable"]),
  }),
});
