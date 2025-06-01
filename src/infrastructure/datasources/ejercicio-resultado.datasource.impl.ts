import mongoose from "mongoose";
import { EjercicioResultadosModel } from "../../data/mongodb/models/ejercicio-resultado.model";
import { EjercicioResultadoDatasource } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class EjercicioResultadoDatasourceImpl
  implements EjercicioResultadoDatasource
{
  constructor() {}
  async registerEjercicio(ejercicioResultado: any): Promise<any> {
    try {
      // Extraer solo los campos que necesitas (según tu esquema)
      const dataToSave = {
        paciente: {
          id_paciente: ejercicioResultado.paciente.id_paciente,
          nombre: ejercicioResultado.paciente.nombre,
          apellido: ejercicioResultado.paciente.apellido,
          edad: ejercicioResultado.paciente.edad,
        },
        ejercicios: ejercicioResultado.ejercicios.map((ej: any) => ({
          titulo: ej.titulo,
          descripcion: ej.descripcion,
          tipo: ej.tipo,
          dificultad: ej.dificultad,
          instrucciones: ej.instrucciones,
          contenido: {
            tipo_contenido: ej.contenido.tipo_contenido,
            contenido: ej.contenido.contenido,
            opciones: ej.contenido.opciones.map((op: any) => ({
              texto: op.texto,
              imagen: op.imagen,
            })),
            respuesta_correcta: ej.contenido.respuesta_correcta,
          },
          ajustesNecesarios: ej.ajustesNecesarios,
          calidad: ej.calidad,
          estado: ej.estado,
          resultado: {
            intentos: ej.resultado.intentos,
            errores: ej.resultado.errores,
          },
        })),
        resumen: {
          total_ejercicios: ejercicioResultado.resumen.total_ejercicios,

          total_errores: ejercicioResultado.resumen.total_errores,
          tiempo_total_formateado:
            ejercicioResultado.resumen.tiempo_total_formateado,
        },
      };

      const newResult = await EjercicioResultadosModel.create(dataToSave);

      return {
        id: newResult._id.toString(),
        ...newResult.toObject(),
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else if (error instanceof mongoose.Error) {
        throw CustomError.serverUnavailable(error.message);
      } else {
        throw CustomError.internalServer();
      }
    }
  }

  async getEjercicio(id_paciente: string): Promise<any[]> {
    try {
      // Obtener fecha de inicio del día actual (00:00:00)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Obtener fecha de fin del día actual (23:59:59)
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const resultados = await EjercicioResultadosModel.find({
        "paciente.id_paciente": id_paciente,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).sort({ createdAt: -1 }); // Orden descendente por fecha

      return resultados.map((result) => ({
        id: result._id.toString(),
        paciente: result.paciente,
        ejercicios: result.ejercicios,
        resumen: result.resumen,
        createdAt: result.createdAt,
      }));
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else if (error instanceof mongoose.Error) {
        throw CustomError.serverUnavailable(error.message);
      } else {
        throw CustomError.internalServer();
      }
    }
  }
}
