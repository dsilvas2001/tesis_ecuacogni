export class EjercicioResultadoEntity {
  constructor(
    public id: string,
    public paciente: {
      id_paciente: string;
      nombre?: string;
      apellido?: string;
      edad?: number;
    },
    public ejercicios: Array<{
      titulo: string;
      descripcion: string;
      tipo: string;
      dificultad: string;
      instrucciones: string;
      contenido: {
        tipo_contenido: string;
        contenido: string;
        opciones: Array<{
          texto: string;
          imagen?: string;
        }>;
        respuesta_correcta: string[];
      };
      ajustesNecesarios?: string;
      calidad?: number;
      estado?: string;
      resultado: {
        intentos: number;
        errores: number;
      };
    }>,
    public resumen: {
      total_ejercicios: number;
      ejercicios_correctos: number;
      total_errores: number;
      tiempo_total_formateado?: string;
    }
  ) {}
}
