import {
  EjercicioModel,
  PacienteEjerciciosModel,
  PacientesModel,
  SignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import { EjercicioPacienteDataSource } from "../../domain";

export class EjercicioPacienteDatasourceImpl
  implements EjercicioPacienteDataSource
{
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

      // Filtro para buscar signos vitales en la fecha seleccionada
      const filtroSignosVitales: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        deletedAt: null,
        "analisis_ia.statusSV": "estable", // Solo pacientes con signos vitales estables
      };

      // Buscar los signos vitales en la fecha seleccionada
      const signosVitales = await SignosVitalesModel.find(filtroSignosVitales)
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

      // Obtener los IDs de los pacientes con signos vitales estables
      const pacientesEstables = signosVitales.map(
        (signo) => signo.id_paciente._id
      );

      // Filtro para buscar ejercicios en la fecha seleccionada
      const filtroEjercicios: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        id_paciente: { $in: pacientesEstables }, // Solo pacientes con signos vitales estables
        deletedAt: null,
      };

      // Buscar los ejercicios en la fecha seleccionada
      const ejercicios = await PacienteEjerciciosModel.find(filtroEjercicios)
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
        .populate({
          path: "id_ejercicio",
          model: EjercicioModel,
          select: "nombre descripcion",
        })
        .exec();

      // Mapear los resultados
      const resultados = pacientesEstables.map((idPaciente) => {
        const paciente = signosVitales.find(
          (signo) => signo.id_paciente._id.toString() === idPaciente.toString()
        )?.id_paciente;

        const ejercicioHoy = ejercicios.find((ejercicio) => {
          return ejercicio.id_paciente._id.toString() === idPaciente.toString();
        });

        let estado;
        let descripcion: string;

        if (ejercicioHoy) {
          estado = ejercicioHoy.estado;
          descripcion =
            estado === "completo"
              ? "Se realizó correctamente el ejercicio"
              : "Falta completar el ejercicio";
        } else {
          estado = "pendiente";
          descripcion = "Falta de realizar el ejercicio o asignar";
        }

        return {
          id_paciente: paciente!._id.toString(),
          nombre: (paciente as any).id_usuario.nombre,
          apellido: (paciente as any).id_usuario.apellido,
          estado,
          date: ejercicioHoy
            ? {
                fecha: ejercicioHoy.createdAt.toLocaleDateString(),
                hora: ejercicioHoy.createdAt.toLocaleTimeString(),
              }
            : {
                fecha: fechaInicio.toLocaleDateString(),
                hora: new Date().toLocaleTimeString(),
              },
          descripcion,
        };
      });
      // Filtrar por estado si no es "todos"
      if (estadoEjercicio && estadoEjercicio !== "todos") {
        const filtrados = resultados.filter(
          (resultado) => resultado.estado === estadoEjercicio
        );
        console.log("Filtrados por estado:", filtrados);
        return filtrados;
      }

      return resultados;
    } catch (error) {
      console.error("Error al buscar los ejercicios:", error);
      throw error;
    }
  }

  async countAll(): Promise<any> {}
}
