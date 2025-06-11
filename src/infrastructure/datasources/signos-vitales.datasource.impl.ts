import mongoose, { Types } from "mongoose";
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
    statusSV: "emergencia" | "estable" | "pendiente" | "todos",
    centroId: string
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

      // 1. Primero obtenemos los IDs de usuarios que pertenecen al centro
      const usuariosDelCentro = await UsuariosModel.find({
        id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
        deletedAt: null,
      }).distinct("_id");

      // 2. Obtenemos los pacientes asociados a esos usuarios
      const pacientesDelCentro = await PacientesModel.find({
        id_usuario: { $in: usuariosDelCentro },
        deletedAt: null,
      }).distinct("_id");

      // 3. Consulta de signos vitales solo para pacientes del centro
      const signosV = await SignosVitalesModel.find({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        id_paciente: { $in: pacientesDelCentro },
        deletedAt: null,
      })
        .populate({
          path: "id_paciente",
          model: PacientesModel,
          select: "id_usuario edad",
          populate: {
            path: "id_usuario",
            model: UsuariosModel,
            select: "nombre apellido",
          },
        })
        .exec();

      // 4. Obtenemos pacientes con referencia que pertenecen al centro
      const pacientesConReferencias =
        await ReferenciaSignosVitalesModel.distinct("id_paciente", {
          id_paciente: { $in: pacientesDelCentro },
          deletedAt: null,
        });

      // 5. Obtenemos información completa de los pacientes del centro
      const pacientesDelCentroCompleto = await PacientesModel.find({
        _id: { $in: pacientesConReferencias },
        deletedAt: null,
      })
        .populate({
          path: "id_usuario",
          model: UsuariosModel,
          select: "nombre apellido",
        })
        .exec();

      // 6. Procesamos los resultados
      const resultados = pacientesDelCentroCompleto.map((paciente) => {
        const signosHoy = signosV.find(
          (sv) => sv.id_paciente._id.toString() === paciente._id.toString()
        );

        // Asegurarse de que id_usuario está poblado
        const usuario = (paciente.id_usuario as any) || {};
        let status = signosHoy?.analisis_ia?.statusSV || "pendiente";
        let descripcion =
          status === "emergencia"
            ? "Signos vitales fuera de rango, evitar hacer ejercicio"
            : status === "estable"
            ? "Signos vitales normales, puede hacer ejercicio"
            : "No se encontraron signos vitales para hoy";

        return {
          id_paciente: paciente._id.toString(),
          nombre: usuario.nombre || "",
          apellido: usuario.apellido || "",
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

      // Filtramos por estado si es necesario
      return statusSV && statusSV !== "todos"
        ? resultados.filter((r) => r.status === statusSV)
        : resultados;
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
      console.log("id_paciente:", id_paciente);

      // 2. Convertir y validar la fecha
      const fechaSeleccionada = new Date(fecha);
      if (isNaN(fechaSeleccionada.getTime())) {
        throw CustomError.badRequest("Fecha no válida");
      }

      // 3. Calcular rango de fechas
      const inicioDia = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        fechaSeleccionada.getDate()
      );
      const finDia = new Date(inicioDia);
      finDia.setDate(inicioDia.getDate() + 1);
      //
      console.log("Rango de fechas:", inicioDia, finDia);
      console.log("id_paciente:", id_paciente);

      // 4. Buscar signos vitales con validación de ObjectId
      const signosVitales = await SignosVitalesModel.find({
        id_paciente: new mongoose.Types.ObjectId(id_paciente), // Conversión explícita
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

      console.log("Signos vitales encontrados:", signosVitales);

      if (signosVitales.length === 0) {
        throw CustomError.badRequest(
          "No se encontraron signos vitales para el paciente en la fecha proporcionada."
        );
      }

      // 5. Mapear resultados
      return signosVitales.map((signoVital) => {
        const paciente = signoVital.id_paciente as unknown as {
          _id: mongoose.Types.ObjectId;
          id_usuario: { nombre: string; apellido: string };
          edad: number;
          genero: string;
        };

        return {
          id_paciente: paciente._id.toString(),
          nombre: paciente.id_usuario.nombre,
          apellido: paciente.id_usuario.apellido,
          edad: paciente.edad,
          genero: paciente.genero,
          fecha: signoVital.createdAt.toLocaleDateString(),
          hora: signoVital.createdAt.toLocaleTimeString(),
          presion_arterial: {
            sistolica: signoVital.presion_arterial?.sistolica,
            diastolica: signoVital.presion_arterial?.diastolica,
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
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error en findByPacienteAndFecha:", error);
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

  async countAll(
    fechaString: string,
    centroId: string
  ): Promise<CountResultSignosV> {
    try {
      const fechaBusqueda = new Date(fechaString);
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate(),
        0,
        0,
        0,
        0
      );
      const fechaFin = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate(),
        23,
        59,
        59,
        999
      );

      // Filtro base para pacientes
      const pacienteFilter: any = { deletedAt: null };

      // Si se proporciona centroId, filtrar pacientes de ese centro
      if (centroId) {
        const usuariosCentro = await UsuariosModel.find({
          id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
          deletedAt: null,
        }).distinct("_id");

        pacienteFilter.id_usuario = { $in: usuariosCentro };
      }

      // Obtener IDs de pacientes filtrados (para optimizar consultas)
      const pacientesFiltrados = await PacientesModel.find(
        pacienteFilter
      ).distinct("_id");

      // Consultas en paralelo
      const [
        count_pacientes_hoy,
        count_signos_vitales_hoy,
        count_emergencia_hoy,
        pacientesConReferencia,
        pacientesConSignosVitalesHoy,
      ] = await Promise.all([
        // 1. Total pacientes (filtrados por centro si aplica)
        PacientesModel.countDocuments(pacienteFilter),

        // 2. Signos vitales del día (filtrados por centro si aplica)
        SignosVitalesModel.countDocuments({
          createdAt: { $gte: fechaInicio, $lte: fechaFin },
          deletedAt: null,
          ...(centroId && { id_paciente: { $in: pacientesFiltrados } }),
        }),

        // 3. Emergencias del día (filtradas por centro si aplica)
        SignosVitalesModel.countDocuments({
          createdAt: { $gte: fechaInicio, $lte: fechaFin },
          "analisis_ia.statusSV": "emergencia",
          deletedAt: null,
          ...(centroId && { id_paciente: { $in: pacientesFiltrados } }),
        }),

        // 4. Pacientes con referencia (filtrados por centro si aplica)
        ReferenciaSignosVitalesModel.distinct("id_paciente", {
          deletedAt: null,
          ...(centroId && { id_paciente: { $in: pacientesFiltrados } }),
        }),

        // 5. Pacientes con signos vitales hoy (filtrados por centro si aplica)
        SignosVitalesModel.distinct("id_paciente", {
          createdAt: { $gte: fechaInicio, $lte: fechaFin },
          deletedAt: null,
          ...(centroId && { id_paciente: { $in: pacientesFiltrados } }),
        }),
      ]);

      // 6. Pacientes con referencia pero sin registros hoy
      const count_sin_registrar = await PacientesModel.countDocuments({
        _id: {
          $in: pacientesConReferencia,
          $nin: pacientesConSignosVitalesHoy,
        },
        ...pacienteFilter,
      });

      return {
        count_pacientes_hoy,
        count_signos_vitales_hoy,
        count_emergencia_hoy,
        count_sin_registrar,
      };
    } catch (error) {
      console.error("Error al obtener el resumen:", error);
      throw CustomError.internalServer();
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
