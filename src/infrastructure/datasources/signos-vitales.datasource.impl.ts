import { Types } from "mongoose";
import {
  PacientesModel,
  ReferenciaSignosVitalesModel,
  SignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import {
  CountResultSignosV,
  OpenAIDto,
  SignosVitalesDatasource,
  SignosVitalesDto,
  SignosVitalesEntity,
  SignosVitalesZod,
} from "../../domain";
import { CustomError } from "../errors/custom.error";
import { SignosVitalesMapper } from "../mappers/signos-vitales.mapper";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";

export class SignosVitalesDatasourceImpl implements SignosVitalesDatasource {
  private openaiDatasource = new OpenAIDatasourceImpl();

  constructor() {}

  async register(signosVitalesDto: SignosVitalesDto): Promise<any> {
    try {
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000

      const finDelDia = new Date(fechaHoy);
      finDelDia.setHours(23, 59, 59, 999); // Establece la hora a 23:59:59.999

      // Verificar si el paciente ya tiene signos vitales registrados en la fecha actual
      const count_paciente_Vitales = await SignosVitalesModel.countDocuments({
        id_paciente: signosVitalesDto.id_paciente,
        deletedAt: null,
        createdAt: {
          $gte: fechaHoy, // Inicio del día
          $lt: finDelDia, // Fin del día
        },
      });

      if (count_paciente_Vitales > 0) {
        throw CustomError.badRequest(
          "Paciente ya tiene agregada la signos vitales"
        );
      }

      // Generar el análisis de IA
      const openAIResponse = await this.generarAnalisisIA(
        signosVitalesDto.id_paciente!,
        signosVitalesDto
      );

      // Crear el nuevo registro de signos vitales
      const nuevaSignosV = new SignosVitalesModel({
        id_paciente: signosVitalesDto.id_paciente,
        presion_arterial: {
          sistolica: signosVitalesDto.presion_arterial!.sistolica,
          diastolica: signosVitalesDto.presion_arterial!.diastolica,
        },
        frecuencia_cardiaca: signosVitalesDto.frecuencia_cardiaca,
        frecuencia_respiratoria: signosVitalesDto.frecuencia_respiratoria,
        temperatura: signosVitalesDto.temperatura,
        analisis_ia: {
          prediccion: openAIResponse.analisis_ia.prediccion,
          recomendaciones: openAIResponse.analisis_ia.recomendaciones,
          alertas: openAIResponse.analisis_ia.alertas,
          plan_accion: openAIResponse.analisis_ia.plan_accion,
          tendencias: openAIResponse.analisis_ia.tendencias,
          reporte_medico_estructurado:
            openAIResponse.analisis_ia.reporte_medico_estructurado,
          explicacion: openAIResponse.analisis_ia.explicacion,
          statusSV: openAIResponse.analisis_ia.statusSV,
        },
      });

      await nuevaSignosV.save();

      // Retornar el documento creado
      return nuevaSignosV;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
    //
  }

  async update(
    id_paciente: string,
    fecha: string,
    signosVitalesDto: SignosVitalesDto
  ): Promise<any> {
    try {
      // Convertir la fecha proporcionada a un objeto Date
      const fechaSeleccionada = new Date(fecha);

      // Obtener el inicio y el final del día de la fecha seleccionada
      const inicioDia = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        fechaSeleccionada.getDate()
      );
      const finDia = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        fechaSeleccionada.getDate() + 1
      );
      const referenciaSignosVitales =
        await ReferenciaSignosVitalesModel.findOne({
          id_paciente: signosVitalesDto.id_paciente,
          deletedAt: null,
        });

      // Buscar el registro de signos vitales del paciente en la fecha proporcionada
      const signosVitales = await SignosVitalesModel.findOne({
        id_paciente,
        createdAt: { $gte: inicioDia, $lt: finDia },
        deletedAt: null,
      });

      if (!signosVitales) {
        throw CustomError.badRequest(
          "No se encontraron signos vitales para el paciente en la fecha proporcionada."
        );
      }

      // Actualizar los valores del registro con los nuevos datos
      signosVitales.presion_arterial = {
        sistolica: signosVitalesDto.presion_arterial!.sistolica,
        diastolica: signosVitalesDto.presion_arterial!.diastolica,
      };
      signosVitales.frecuencia_cardiaca = signosVitalesDto.frecuencia_cardiaca!;
      signosVitales.frecuencia_respiratoria =
        signosVitalesDto.frecuencia_respiratoria!;
      signosVitales.temperatura = signosVitalesDto.temperatura!;

      // Generar el análisis de IA
      const openAIResponse = await this.generarAnalisisIA(
        id_paciente,
        signosVitalesDto
      );

      // Actualizar los datos del análisis de IA
      signosVitales.analisis_ia = {
        prediccion: openAIResponse.analisis_ia.prediccion,
        recomendaciones: openAIResponse.analisis_ia.recomendaciones,
        alertas: openAIResponse.analisis_ia.alertas,
        plan_accion: openAIResponse.analisis_ia.plan_accion,
        tendencias: openAIResponse.analisis_ia.tendencias,
        reporte_medico_estructurado:
          openAIResponse.analisis_ia.reporte_medico_estructurado,
        explicacion: openAIResponse.analisis_ia.explicacion,
        statusSV: openAIResponse.analisis_ia.statusSV,
      };

      // Guardar el registro actualizado
      await signosVitales.save();

      // Imprimir el registro actualizado en la consola

      // Retornar el documento actualizado
      return openAIResponse;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  private async generarAnalisisIA(
    id_paciente: string,
    signosVitalesDto: SignosVitalesDto
  ): Promise<any> {
    try {
      // Obtener los datos del paciente
      const pacientes = await PacientesModel.find({
        deletedAt: null,
        _id: id_paciente,
      }).populate({
        path: "id_usuario",
        model: UsuariosModel,
        match: { deletedAt: null },
        select: "nombre apellido",
      });

      if (!pacientes || pacientes.length === 0) {
        throw CustomError.badRequest("Paciente no encontrado");
      }

      const usuario = pacientes[0].id_usuario as unknown as {
        nombre: string;
        apellido: string;
      };

      // Obtener las referencias de signos vitales del paciente
      const referenciaSignosVitales =
        await ReferenciaSignosVitalesModel.findOne({
          id_paciente,
          deletedAt: null,
        });

      if (!referenciaSignosVitales) {
        throw CustomError.badRequest(
          "No se encontraron referencias de signos vitales para el paciente"
        );
      }

      // Construir el prompt con los límites de referencia
      const prompt = `
  Eres un asistente médico de IA especializado en el monitoreo y análisis de signos vitales de los pacientes. Debes proporcionar una evaluación médica detallada y estructurada en **español**, con un nivel de explicación clara y profesional.  

  ### **Información del paciente:**  
  - **ID:** ${pacientes[0]._id}  
  - **Nombre:** ${usuario.nombre} ${usuario.apellido}  
  - **Edad:** ${pacientes[0].edad} años  
  - **Género:** ${pacientes[0].genero}  

  ### **Límites de referencia para los signos vitales:**  
  - **Presión arterial:**  
    - Sistólica: ${referenciaSignosVitales.presion_arterial!.sistolica_min} - ${
        referenciaSignosVitales.presion_arterial!.sistolica_max
      } mmHg  
    - Diastólica: ${
      referenciaSignosVitales.presion_arterial!.diastolica_min
    } - ${referenciaSignosVitales.presion_arterial!.diastolica_max} mmHg  
  - **Frecuencia cardíaca:** ${
    referenciaSignosVitales.frecuencia_cardiaca!.min
  } - ${referenciaSignosVitales.frecuencia_cardiaca!.max} bpm  
  - **Frecuencia respiratoria:** ${
    referenciaSignosVitales.frecuencia_respiratoria!.min
  } - ${
        referenciaSignosVitales.frecuencia_respiratoria!.max
      } respiraciones/min  
  - **Temperatura:** ${referenciaSignosVitales.temperatura!.min} - ${
        referenciaSignosVitales.temperatura!.max
      } °C  

  ### **Datos actuales de signos vitales:**  
  - **Presión arterial:** ${signosVitalesDto.presion_arterial!.sistolica}/${
        signosVitalesDto.presion_arterial!.diastolica
      } mmHg  
  - **Frecuencia cardíaca:** ${signosVitalesDto.frecuencia_cardiaca} bpm  
  - **Frecuencia respiratoria:** ${
    signosVitalesDto.frecuencia_respiratoria
  } respiraciones/min  
  - **Temperatura:** ${signosVitalesDto.temperatura} °C  

  ### **Instrucciones:**  
  - Compara los valores actuales de los signos vitales con los límites de referencia proporcionados.  
  - Si algún valor está fuera de los límites, indica claramente cuál es el problema y su posible impacto en la salud del paciente.  
  - Proporciona una evaluación médica detallada, incluyendo predicciones, estado clínico, explicación, alertas, recomendaciones y un plan de acción.  
  - En la sección de **tendencias**, analiza cómo los valores actuales se comparan con los límites de referencia. **Menciona explícitamente los límites de referencia** y explica si los valores están dentro de los rangos normales, ligeramente alterados o significativamente fuera de los límites.  
  - La salida debe estar estructurada en JSON.  
`;

      // Llamar a la IA para generar el análisis
      const openAIDto = OpenAIDto.create({ prompt })[1];
      const openAIResponse = await this.openaiDatasource.generateText(
        openAIDto!,
        SignosVitalesZod
      );

      return openAIResponse;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  //LEER

  async findAll(
    fechaSeleccionada: string,
    statusSV: "emergencia" | "estable" | "pendiente" | "todos"
  ): Promise<SignosVitalesEntity[]> {
    try {
      const fechaBusqueda = fechaSeleccionada
        ? new Date(fechaSeleccionada)
        : new Date();
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate()
      );
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(23, 59, 59, 999);

      const filtro: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
      };

      const signosV = await SignosVitalesModel.find(filtro)
        .populate({
          path: "id_paciente",
          model: PacientesModel,
          select: "id_usuario",
          populate: {
            path: "id_usuario",
            model: UsuariosModel,
            select: "nombre apellido",
          },
        })
        .exec();

      const pacientesConReferencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      }).distinct("id_paciente");

      const todosLosPacientes = await PacientesModel.find({
        _id: { $in: pacientesConReferencias },
        deletedAt: null,
      })
        .populate({
          path: "id_usuario",
          model: UsuariosModel,
          select: "nombre apellido",
        })
        .exec();

      const resultados = todosLosPacientes.map((paciente) => {
        const signosHoy = signosV.find((sv) => {
          return sv.id_paciente._id.toString() === paciente._id.toString();
        });

        let status;
        let descripcion: string;

        if (signosHoy) {
          status = signosHoy.analisis_ia!.statusSV;
          descripcion =
            status === "emergencia"
              ? "Signos vitales fuera de rango, evitar hacer ejercicio"
              : status === "estable"
              ? "Signos vitales normales, puede hacer ejercicio"
              : "Necesita revisión de signos vitales";
        } else {
          status = "pendiente";
          descripcion = "No se encontraron signos vitales para hoy";
        }

        return {
          id_paciente: paciente._id.toString(),
          nombre: (paciente.id_usuario as any).nombre,
          apellido: (paciente.id_usuario as any).apellido,
          edad: paciente.edad,
          date: signosHoy
            ? {
                fecha: signosHoy.createdAt.toLocaleDateString(),
                hora: signosHoy.createdAt.toLocaleTimeString(),
              }
            : {
                fecha: fechaInicio.toLocaleDateString(),
                hora: new Date().toLocaleTimeString(),
              },
          descripcion,
          status,
        };
      });

      if (statusSV && statusSV !== "todos") {
        const filtrados = resultados.filter(
          (resultado) => resultado.status === statusSV
        );
        console.log("Filtrados por estado:", filtrados);
        return filtrados;
      }

      return resultados;
    } catch (error) {
      console.error("Error al buscar los signos vitales:", error);
      throw error;
    }
  }

  async findByPacienteAndFecha(
    id_paciente: string,
    fecha: string
  ): Promise<any> {
    try {
      // Convertir la fecha proporcionada a un objeto Date

      const fechaSeleccionada = new Date(fecha);

      // Calcular el inicio y el final del día de la fecha seleccionada
      const inicioDia = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        fechaSeleccionada.getDate()
      );
      const finDia = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        fechaSeleccionada.getDate() + 1
      );

      // Buscar signos vitales del paciente en el rango de fechas y que no estén eliminados
      const signosVitales = await SignosVitalesModel.find({
        id_paciente,
        createdAt: { $gte: inicioDia, $lt: finDia },
        deletedAt: null,
      })
        .populate({
          path: "id_paciente",
          model: PacientesModel,
          select: "id_usuario edad genero",
          populate: {
            path: "id_usuario",
            model: UsuariosModel,
            select: "nombre apellido",
          },
        })
        .exec();

      // Si no se encuentran registros, se lanza un error
      if (signosVitales.length === 0) {
        throw CustomError.badRequest(
          "No se encontraron signos vitales para el paciente en la fecha proporcionada."
        );
      }

      // Mapear los resultados para devolver la información deseada
      const resultados = signosVitales.map((signoVital) => {
        const paciente = signoVital.id_paciente as any;
        const usuario = paciente.id_usuario;

        return {
          id_paciente: paciente._id.toString(),
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          edad: paciente.edad,
          genero: paciente.genero,
          fecha: signoVital.createdAt.toLocaleDateString(),
          hora: signoVital.createdAt.toLocaleTimeString(),
          presion_arterial: {
            sistolica: signoVital.presion_arterial!.sistolica,
            diastolica: signoVital.presion_arterial!.diastolica,
          },
          frecuencia_cardiaca: signoVital.frecuencia_cardiaca,
          frecuencia_respiratoria: signoVital.frecuencia_respiratoria,
          temperatura: signoVital.temperatura,
          analisis_ia: {
            prediccion: signoVital.analisis_ia?.prediccion,
            recomendaciones: signoVital.analisis_ia?.recomendaciones,
            alertas: signoVital.analisis_ia?.alertas,
            plan_accion: signoVital.analisis_ia?.plan_accion,
            tendencias: signoVital.analisis_ia?.tendencias,
            reporte_medico_estructurado:
              signoVital.analisis_ia?.reporte_medico_estructurado,
            explicacion: signoVital.analisis_ia?.explicacion,
            statusSV: signoVital.analisis_ia?.statusSV,
          },
        };
      });

      return resultados;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  // DELETE

  async delete(id_paciente: string, fecha: string): Promise<string> {
    try {
      // Convertir la fecha proporcionada a un objeto Date
      const fechaSeleccionada = new Date(fecha);

      const finDelDia = new Date(fechaSeleccionada);
      finDelDia.setHours(23, 59, 59, 999); // Establece la hora a 23:59:59.999

      const result = await SignosVitalesModel.findOneAndUpdate(
        {
          id_paciente: id_paciente,
          createdAt: { $gte: fechaSeleccionada, $lt: finDelDia },
          deletedAt: null,
        },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!result) {
        throw CustomError.badRequest(
          "No se encontro los signos vitales a eliminar"
        );
      }

      return "Signos vitales eliminados correctamente";
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  //COUNT

  async countAll(fechaString: string): Promise<CountResultSignosV> {
    try {
      // Convertir la fecha string a un objeto Date
      const fechaBusqueda = new Date(fechaString);

      // Definir el inicio del día
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate(),
        0,
        0,
        0,
        0
      );

      // Definir el final del día
      const fechaFin = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate(),
        23,
        59,
        59,
        999
      );

      // 1. Pacientes Agregados (total)
      const count_pacientes_hoy = await PacientesModel.countDocuments({
        deletedAt: null,
      });

      // 2. Signos Vitales (en la fecha específica)
      const count_signos_vitales_hoy = await SignosVitalesModel.countDocuments({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
      });

      // 3. Emergencia (en la fecha específica) (statusSV = "emergencia")
      const count_emergencia_hoy = await SignosVitalesModel.countDocuments({
        createdAt: { $gte: fechaInicio, $lte: fechaFin }, // <-- Cambio aquí
        "analisis_ia.statusSV": "emergencia",
        deletedAt: null,
      });

      // 4. Pacientes con referencia pero sin registros de signos vitales en la fecha específica
      const pacientesConReferencia =
        await ReferenciaSignosVitalesModel.distinct("id_paciente", {
          deletedAt: null,
        });

      const pacientesConSignosVitalesHoy = await SignosVitalesModel.distinct(
        "id_paciente",
        {
          createdAt: { $gte: fechaInicio, $lte: fechaFin }, // <-- Cambio aquí
          deletedAt: null,
        }
      );

      const count_sin_registrar = await PacientesModel.countDocuments({
        _id: {
          $in: pacientesConReferencia,
          $nin: pacientesConSignosVitalesHoy,
        },
        deletedAt: null,
      });

      // Combinar los resultados en un objeto
      const combinedObject = {
        count_pacientes_hoy,
        count_signos_vitales_hoy,
        count_emergencia_hoy,
        count_sin_registrar,
      };

      return combinedObject;
    } catch (error) {
      console.error("Error al obtener el resumen de referencias de SV:", error);
      throw error;
    }
  }

  private validarLimitesReferencia(
    signosVitalesDto: SignosVitalesDto,
    referenciaSignosVitales: any
  ): void {
    const {
      presion_arterial,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
    } = signosVitalesDto;

    const errores: string[] = [];

    // Validar presión arterial
    if (
      presion_arterial!.sistolica <
        referenciaSignosVitales.presion_arterial.sistolica_min ||
      presion_arterial!.sistolica >
        referenciaSignosVitales.presion_arterial.sistolica_max
    ) {
      errores.push(
        `Presión arterial sistólica (${
          presion_arterial!.sistolica
        } mmHg) está fuera de los límites de referencia (${
          referenciaSignosVitales.presion_arterial.sistolica_min
        }-${referenciaSignosVitales.presion_arterial.sistolica_max} mmHg).`
      );
    }
    if (
      presion_arterial!.diastolica <
        referenciaSignosVitales.presion_arterial.diastolica_min ||
      presion_arterial!.diastolica >
        referenciaSignosVitales.presion_arterial.diastolica_max
    ) {
      errores.push(
        `Presión arterial diastólica (${
          presion_arterial!.diastolica
        } mmHg) está fuera de los límites de referencia (${
          referenciaSignosVitales.presion_arterial.diastolica_min
        }-${referenciaSignosVitales.presion_arterial.diastolica_max} mmHg).`
      );
    }

    // Validar frecuencia cardíaca
    if (
      frecuencia_cardiaca! < referenciaSignosVitales.frecuencia_cardiaca.min ||
      frecuencia_cardiaca! > referenciaSignosVitales.frecuencia_cardiaca.max
    ) {
      errores.push(
        `Frecuencia cardíaca (${frecuencia_cardiaca} bpm) está fuera de los límites de referencia (${referenciaSignosVitales.frecuencia_cardiaca.min}-${referenciaSignosVitales.frecuencia_cardiaca.max} bpm).`
      );
    }

    // Validar frecuencia respiratoria
    if (
      frecuencia_respiratoria! <
        referenciaSignosVitales.frecuencia_respiratoria.min ||
      frecuencia_respiratoria! >
        referenciaSignosVitales.frecuencia_respiratoria.max
    ) {
      errores.push(
        `Frecuencia respiratoria (${frecuencia_respiratoria} respiraciones/min) está fuera de los límites de referencia (${referenciaSignosVitales.frecuencia_respiratoria.min}-${referenciaSignosVitales.frecuencia_respiratoria.max} respiraciones/min).`
      );
    }

    // Validar temperatura
    if (
      temperatura! < referenciaSignosVitales.temperatura.min ||
      temperatura! > referenciaSignosVitales.temperatura.max
    ) {
      errores.push(
        `Temperatura (${temperatura} °C) está fuera de los límites de referencia (${referenciaSignosVitales.temperatura.min}-${referenciaSignosVitales.temperatura.max} °C).`
      );
    }

    // Si hay errores, lanzar una excepción con los mensajes detallados
    if (errores.length > 0) {
      throw CustomError.badRequest(errores.join(" "));
    }
  }
}
