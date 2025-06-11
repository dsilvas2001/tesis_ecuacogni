import {
  PacientesModel,
  ReferenciaSignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import {
  NotReferenciaSignoVEntity,
  ReferenciaSignosVDataSource,
  ReferenciaSignosVDto,
  ReferenciaSignosVEntity,
} from "../../domain";
import { CustomError } from "../errors/custom.error";
import { ReferenciaSignosVMapper } from "../mappers/referencias-signosv.mapper";
import { CountResultReferenciaSignosV } from "../../domain/entities/referencias-signosv.entity";
import mongoose from "mongoose";

export class ReferenciaSignosVDatasourceImpl
  implements ReferenciaSignosVDataSource
{
  constructor() {}

  async register(referenciaSignosVDto: ReferenciaSignosVDto): Promise<any> {
    try {
      // Crear un nuevo documento en la base de datos usando el modelo

      const count_paciente_referencia =
        (await ReferenciaSignosVitalesModel.countDocuments({
          id_paciente: referenciaSignosVDto.id_paciente,
          deletedAt: null,
        })) || 0;

      if (count_paciente_referencia) {
        throw CustomError.badRequest(
          "Paciente ya tiene agregada la referencia"
        );
      }

      const pacientes = await PacientesModel.findById(
        referenciaSignosVDto.id_paciente
      );

      if (!pacientes) {
        throw CustomError.badRequest("Paciente not found");
      }

      const nuevaReferencia = new ReferenciaSignosVitalesModel({
        id_paciente: referenciaSignosVDto.id_paciente,
        presion_arterial: {
          sistolica_min: referenciaSignosVDto.presion_arterial!.sistolica_min,
          sistolica_max: referenciaSignosVDto.presion_arterial!.sistolica_max,
          diastolica_min: referenciaSignosVDto.presion_arterial!.diastolica_min,
          diastolica_max: referenciaSignosVDto.presion_arterial!.diastolica_max,
        },
        frecuencia_cardiaca: {
          min: referenciaSignosVDto.frecuencia_cardiaca!.min,
          max: referenciaSignosVDto.frecuencia_cardiaca!.max,
        },
        frecuencia_respiratoria: {
          min: referenciaSignosVDto.frecuencia_respiratoria!.min,
          max: referenciaSignosVDto.frecuencia_respiratoria!.max,
        },
        temperatura: {
          min: referenciaSignosVDto.temperatura!.min,
          max: referenciaSignosVDto.temperatura!.max,
        },
      });

      // Guardar el documento en la base de datos
      await nuevaReferencia.save();

      // Retornar el documento creado
      return nuevaReferencia;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
    }
    throw CustomError.internalServer();
  }

  async update(
    pacienteId: string,
    updateDto: ReferenciaSignosVDto
  ): Promise<any> {
    try {
      console.log("Paciente ID recibido:", pacienteId);

      // Verificar si la referencia ya existe
      const referenciaExistente = await ReferenciaSignosVitalesModel.findOne({
        id_paciente: pacienteId,
      });

      if (!referenciaExistente) {
        throw CustomError.badRequest(
          "Rangos de referencia no encontrados para el paciente"
        );
      }

      console.log("Referencia encontrada:", referenciaExistente);

      // Actualizar los valores directamente con findOneAndUpdate
      const referenciaActualizada =
        await ReferenciaSignosVitalesModel.findOneAndUpdate(
          { id_paciente: pacienteId },
          { $set: updateDto }, // Actualizar con los nuevos valores
          { new: true } // Retorna el documento actualizado
        );

      console.log("Referencia actualizada:", referenciaActualizada);

      return referenciaActualizada;
    } catch (error) {
      console.error("Error al actualizar referencia:", error);
      throw CustomError.internalServer(
        "Error al actualizar los rangos de referencia"
      );
    }
  }

  async findAll(centroId: string): Promise<ReferenciaSignosVEntity[]> {
    try {
      const referencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      })
        .populate({
          path: "id_paciente",
          model: "Paciente",
          select: "id_usuario",
          populate: {
            path: "id_usuario",
            model: "Usuarios", // Exactamente como en mongoose.model()
            select: "nombre apellido id_centro_gerontologico",
            match: {
              id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
            },
          },
        })
        .exec();

      const referenciasFiltradas = referencias.filter((ref) => {
        const paciente = ref.id_paciente as any;
        return paciente?.id_usuario?.id_centro_gerontologico;
      });

      return ReferenciaSignosVMapper.referenciaSignosVAllEntitiesFromObjects(
        referenciasFiltradas
      );
    } catch (error) {
      console.error("Error al buscar referencias por centro:", error);
      throw CustomError.internalServer();
    }
  }

  async findNotReferenciaSignosV(
    centroId: string
  ): Promise<NotReferenciaSignoVEntity[]> {
    try {
      // 1. Obtener todas las referencias de signos vitales no eliminadas
      const referencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      })
        .select("id_paciente")
        .exec();

      // 2. Construir query base para pacientes
      const pacienteQuery: any = { deletedAt: null };

      // 3. Si se proporciona centroId, añadir filtro por centro
      if (centroId) {
        pacienteQuery.id_usuario = {
          $in: await UsuariosModel.find({
            id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
            deletedAt: null,
          })
            .select("_id")
            .exec(),
        };
      }

      // 4. Obtener todos los pacientes (filtrados por centro si aplica)
      const todosLosPacientes = await PacientesModel.find(pacienteQuery)
        .populate({
          path: "id_usuario",
          model: UsuariosModel,
          select: "nombre apellido",
          match: { deletedAt: null },
        })
        .exec();

      // 5. Filtrar pacientes sin referencia
      const pacientesSinReferencia = todosLosPacientes.filter((paciente) => {
        // Verificar si el usuario existe (por el populate match)
        if (!paciente.id_usuario) return false;

        return !referencias.some(
          (referencia) =>
            referencia.id_paciente.toString() === paciente._id.toString()
        );
      });

      // 6. Mapear al formato de respuesta
      return pacientesSinReferencia.map((paciente) => {
        const usuario = paciente.id_usuario as unknown as {
          nombre: string;
          apellido: string;
        };

        return new NotReferenciaSignoVEntity(
          paciente._id.toString(),
          usuario.nombre,
          usuario.apellido,
          "0", // presion_arterial
          "0", // frecuencia_cardiaca
          "0", // frecuencia_respiratoria
          "0", // temperatura
          undefined // deletedAt
        );
      });
    } catch (error) {
      console.error("Error al buscar pacientes sin referencia:", error);
      throw CustomError.internalServer();
    }
  }
  async delete(id_paciente: string): Promise<string> {
    try {
      const paciente = await ReferenciaSignosVitalesModel.findOne({
        id_paciente,
      });

      if (!paciente) {
        throw CustomError.badRequest("Paciente not found");
      }

      // Actualizar el campo deletedAt con la fecha actual
      const deletedAt = new Date();

      const result = await ReferenciaSignosVitalesModel.findOneAndUpdate(
        { id_paciente: id_paciente },
        { deletedAt },
        { new: true }
      );
      if (!result) {
        throw CustomError.badRequest("No se encontro la referencia a eliminar");
      }
      console.log("result");
      console.log("result");
      console.log(result);

      return "Referencia eliminada correctamente";
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
    }
    throw CustomError.internalServer();
  }

  async countAll(centroId: string): Promise<CountResultReferenciaSignosV> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // 1. Preparar filtro base
      const baseFilter = { deletedAt: null };

      // 2. Obtener pacientes del centro si se especifica
      let pacientesFilter: any = { deletedAt: null };
      if (centroId) {
        const usuariosCentro = await UsuariosModel.find({
          id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
          deletedAt: null,
        })
          .select("_id")
          .lean();

        pacientesFilter.id_usuario = {
          $in: usuariosCentro.map((u) => u._id),
        };
      }

      // 3. Contar referencias (totales y de hoy)
      const [count_referentes, count_referentes_hoy] = await Promise.all([
        ReferenciaSignosVitalesModel.countDocuments(baseFilter),
        ReferenciaSignosVitalesModel.countDocuments({
          ...baseFilter,
          createdAt: { $gte: hoy },
        }),
      ]);

      // 4. Obtener IDs de pacientes con referencia
      const referencias = await ReferenciaSignosVitalesModel.find(baseFilter)
        .select("id_paciente")
        .lean();

      // 5. Contar pacientes totales (filtrados por centro si aplica)
      const totalPacientes = await PacientesModel.countDocuments(
        pacientesFilter
      );

      // 6. Calcular pacientes sin referencia
      const pacientesConReferencia = new Set(
        referencias.map((ref) => ref.id_paciente.toString())
      );

      // Si hay filtro por centro, necesitamos verificar qué pacientes con referencia pertenecen al centro
      let count_sin_referentes;
      if (centroId) {
        const pacientesCentroConReferencia =
          await PacientesModel.countDocuments({
            ...pacientesFilter,
            _id: {
              $in: Array.from(pacientesConReferencia).map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
            },
          });
        count_sin_referentes = totalPacientes - pacientesCentroConReferencia;
      } else {
        count_sin_referentes = totalPacientes - pacientesConReferencia.size;
      }

      return new CountResultReferenciaSignosV(
        count_referentes,
        count_referentes_hoy,
        count_sin_referentes
      );
    } catch (error) {
      console.error("Error al obtener el resumen de referencias:", error);
      throw CustomError.internalServer();
    }
  }
}
