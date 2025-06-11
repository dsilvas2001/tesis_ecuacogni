import mongoose from "mongoose";
import {
  EjercicioModel,
  PacienteEjerciciosModel,
  PacientesModel,
  SignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import { EjercicioResultadosModel } from "../../data/mongodb/models/ejercicio-resultado.model";
import {
  EjercicioPacienteDataSource,
  OpenAIDto,
  SelectCategoriaZod,
  SignosVitalesDto,
} from "../../domain";
import { CustomError } from "../errors/custom.error";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";

export class EjercicioPacienteDatasourceImpl
  implements EjercicioPacienteDataSource
{
  private openaiDatasource = new OpenAIDatasourceImpl();

  constructor() {}

  async findAll(
    fechaSeleccionada: string,
    estadoEjercicio: "completo" | "incompleto" | "pendiente" | "todos",
    centroId: string
  ): Promise<any[]> {
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

      // 1. Construir filtro base para pacientes del centro
      const pacienteFilter: any = {};
      if (centroId) {
        const usuariosCentro = await UsuariosModel.find({
          id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
          deletedAt: null,
        }).distinct("_id");

        pacienteFilter.id_usuario = { $in: usuariosCentro };
      }

      // 2. Obtener IDs de pacientes del centro (si aplica)
      const pacientesDelCentro = centroId
        ? await PacientesModel.find(pacienteFilter).distinct("_id")
        : null;

      // 3. Buscar signos vitales (filtrados por centro si aplica)
      const signosVitalesFilter: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
        "analisis_ia.statusSV": "estable",
        ...(centroId && { id_paciente: { $in: pacientesDelCentro } }),
      };

      const signosVitales = await SignosVitalesModel.find(signosVitalesFilter)
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

      const pacientesEstables = signosVitales.map(
        (signo) => signo.id_paciente._id
      );

      // 4. Buscar RESULTADOS de ejercicios (filtrados por centro si aplica)
      const resultadosEjerciciosFilter: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        "paciente.id_paciente": {
          $in: pacientesEstables.map((id) => id.toString()),
        },
        ...(centroId && {
          "paciente.id_paciente": {
            $in: pacientesDelCentro?.map((id) => id.toString()),
          },
        }),
      };

      const resultadosEjercicios = await EjercicioResultadosModel.find(
        resultadosEjerciciosFilter
      ).exec();

      // 5. Mapear resultados
      const resultados = signosVitales.map((signoVital) => {
        const idPaciente = signoVital.id_paciente._id.toString();
        const paciente: any =
          signoVital.id_paciente && typeof signoVital.id_paciente === "object"
            ? signoVital.id_paciente
            : null;

        const tieneResultados = resultadosEjercicios.some(
          (res) => res.paciente!.id_paciente === idPaciente
        );

        const estado = tieneResultados ? "completo" : "pendiente";
        const descripcion = tieneResultados
          ? "Se realizó correctamente el ejercicio"
          : "Falta de realizar el ejercicio o asignar";

        return {
          id_paciente: idPaciente,
          nombre:
            paciente && paciente.id_usuario && paciente.id_usuario.nombre
              ? paciente.id_usuario.nombre
              : "",
          apellido:
            paciente && paciente.id_usuario && paciente.id_usuario.apellido
              ? paciente.id_usuario.apellido
              : "",
          edad: paciente && paciente.edad ? paciente.edad : "",
          estado,
          date: {
            fecha: fechaInicio.toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
          },
          descripcion,
          ...(centroId && { centroId }), // Opcional: incluir centro en respuesta
        };
      });

      // Filtrar por estado
      if (estadoEjercicio && estadoEjercicio !== "todos") {
        return resultados.filter(
          (resultado) => resultado.estado === estadoEjercicio
        );
      }

      return resultados;
    } catch (error) {
      console.error("Error al buscar los ejercicios:", error);
      throw error;
    }
  }

  async countAll(centroId: string): Promise<any> {
    try {
      const fechaBusqueda = new Date();
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate()
      );
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(23, 59, 59, 999);

      // 1. Construir filtro base para pacientes del centro
      const pacienteFilter: any = {};
      if (centroId) {
        const usuariosCentro = await UsuariosModel.find({
          id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
          deletedAt: null,
        }).distinct("_id");

        pacienteFilter.id_usuario = { $in: usuariosCentro };
      }

      // 2. Obtener IDs de pacientes del centro (si aplica)
      const pacientesDelCentro = centroId
        ? await PacientesModel.find(pacienteFilter).distinct("_id")
        : null;

      // 3. Buscar pacientes estables (filtrados por centro si aplica)
      const signosVitalesFilter: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
        "analisis_ia.statusSV": "estable",
        ...(centroId && { id_paciente: { $in: pacientesDelCentro } }),
      };

      const signosVitales = await SignosVitalesModel.find(signosVitalesFilter)
        .populate({
          path: "id_paciente",
          select: "_id",
        })
        .exec();

      const pacientesEstablesIds = signosVitales.map(
        (signo) => signo.id_paciente._id
      );

      // 4. Buscar qué pacientes completaron ejercicios hoy (filtrados por centro si aplica)
      const resultadosFilter: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        "paciente.id_paciente": {
          $in: pacientesEstablesIds.map((id) => id.toString()),
        },
        ...(centroId && {
          "paciente.id_paciente": {
            $in: pacientesDelCentro?.map((id) => id.toString()),
          },
        }),
      };

      const resultados = await EjercicioResultadosModel.find(
        resultadosFilter
      ).exec();

      // 5. Calcular métricas
      const pacientesCompletados = [
        ...new Set(resultados.map((res) => res.paciente!.id_paciente)),
      ].length;
      const pacientesPendientes =
        pacientesEstablesIds.length - pacientesCompletados;

      return {
        pacientesEstables: pacientesEstablesIds.length,
        pacientesCompletados,
        pacientesPendientes,
        ...(centroId && { centroId }), // Opcional: incluir el centroId en la respuesta
      };
    } catch (error) {
      console.error("Error al contar los ejercicios:", error);
      throw error;
    }
  }

  async selectCategoria(signosVitalesDto: SignosVitalesDto): Promise<any> {
    try {
      // Construir el prompt con los datos del DTO

      const prompt = `
      Eres un asistente médico de inteligencia artificial especializado en el monitoreo de signos vitales y su impacto en las funciones cognitivas. Tu tarea es analizar los signos vitales de un paciente y, solo si se encuentra clínicamente estable, asignar **una o más categorías de estimulación cognitiva**. La respuesta debe estar redactada en **español formal**, con una evaluación médica coherente, concisa y justificada.
      
      ### Datos actuales de signos vitales:
      - **Presión arterial:** ${signosVitalesDto.presion_arterial!.sistolica}/${
        signosVitalesDto.presion_arterial!.diastolica
      } mmHg
      - **Frecuencia cardíaca:** ${signosVitalesDto.frecuencia_cardiaca} bpm
      - **Frecuencia respiratoria:** ${
        signosVitalesDto.frecuencia_respiratoria
      } respiraciones/min
      - **Temperatura:** ${signosVitalesDto.temperatura} °C
      
      ### Instrucciones:
      1. Evalúa si el paciente presenta un estado clínico **estable**: todos los signos vitales deben estar dentro de rangos normales o presentar solo alteraciones **leves** y sin riesgo inmediato.
      2. **Solo si el paciente está estable**, elige **una o más de las siguientes categorías** de estimulación cognitiva:
         - **Memoria**
         - **Atención**
         - **Lenguaje**
      3. Aplica la siguiente lógica clínica:
         - **Memoria**: Leve hipotensión, fatiga o ligera hipoxia pueden estar relacionadas con dificultades de retención.
         - **Atención**: Leve fiebre (≤ 37.8 °C), ligera taquicardia (hasta 100 bpm) o respiración algo elevada (hasta 22 rpm) pueden afectar la concentración.
         - **Lenguaje**: Todos los signos vitales dentro de rango normal, sin alteraciones relevantes → posibles efectos leves en el lenguaje.
      
      4. Si hay **signos vitales alterados de forma moderada o grave**, concluye que **no es recomendable realizar ejercicios cognitivos** en este momento.
      
      Entrega una breve evaluación médica justificada. Sé preciso y evita generalizar.
      `;

      // Llamar a la IA para generar el análisis
      const openAIDto = OpenAIDto.create({ prompt })[1];
      const openAIResponse = await this.openaiDatasource.generateText(
        openAIDto!,
        SelectCategoriaZod
      );

      // Devolver la respuesta de la IA
      return openAIResponse;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
