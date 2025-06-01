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
    estadoEjercicio: "completo" | "incompleto" | "pendiente" | "todos"
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

      // 1. Buscar signos vitales (igual que antes)
      const signosVitales = await SignosVitalesModel.find({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
        "analisis_ia.statusSV": "estable",
      })
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

      const pacientesEstables = signosVitales.map(
        (signo) => signo.id_paciente._id
      );

      // 2. Buscar RESULTADOS de ejercicios (nuevo)
      const resultadosEjercicios = await EjercicioResultadosModel.find({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        "paciente.id_paciente": {
          $in: pacientesEstables.map((id) => id.toString()),
        },
      }).exec();

      // 3. Mapear resultados (conservando tu estructura original)
      const resultados = pacientesEstables.map((idPaciente) => {
        const paciente = signosVitales.find(
          (signo) => signo.id_paciente._id.toString() === idPaciente.toString()
        )?.id_paciente;

        // Verificar si tiene resultados
        const tieneResultados = resultadosEjercicios.some(
          (res) => res.paciente!.id_paciente === idPaciente.toString()
        );

        let estado;
        let descripcion;

        if (tieneResultados) {
          estado = "completo";
          descripcion = "Se realizó correctamente el ejercicio";
        } else {
          estado = "pendiente";
          descripcion = "Falta de realizar el ejercicio o asignar";
        }

        return {
          id_paciente: paciente!._id.toString(),
          nombre: (paciente as any).id_usuario.nombre,
          apellido: (paciente as any).id_usuario.apellido,
          estado,
          date: {
            fecha: fechaInicio.toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
          },
          descripcion,
        };
      });

      // Filtrar por estado (igual que antes)
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

  async countAll(): Promise<any> {
    try {
      const fechaBusqueda = new Date();
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate()
      );
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(23, 59, 59, 999);

      // 1. Buscar pacientes estables
      const signosVitales = await SignosVitalesModel.find({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
        "analisis_ia.statusSV": "estable",
      }).exec();

      const pacientesEstablesIds = signosVitales.map(
        (signo) => signo.id_paciente._id
      );

      // 2. Buscar qué pacientes completaron ejercicios hoy
      const resultados = await EjercicioResultadosModel.find({
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        "paciente.id_paciente": {
          $in: pacientesEstablesIds.map((id) => id.toString()),
        },
      }).exec();

      // 3. Calcular métricas
      const pacientesCompletados = [
        ...new Set(resultados.map((res) => res.paciente!.id_paciente)),
      ].length;
      const pacientesPendientes =
        pacientesEstablesIds.length - pacientesCompletados;

      return {
        pacientesEstables: pacientesEstablesIds.length,
        pacientesCompletados, // Pacientes con ejercicios registrados hoy
        pacientesPendientes, // Pacientes sin ejercicios registrados hoy
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
