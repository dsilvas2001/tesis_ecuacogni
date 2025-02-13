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

export class ReferenciaSignosVDatasourceImpl
  implements ReferenciaSignosVDataSource
{
  constructor() {}

  async register(referenciaSignosVDto: ReferenciaSignosVDto): Promise<any> {
    try {
      // Crear un nuevo documento en la base de datos usando el modelo

      console.log("referenciaSignosVDto");
      console.log("referenciaSignosVDto");
      console.log(referenciaSignosVDto);

      const pacientes = await PacientesModel.findById(
        referenciaSignosVDto.id_paciente
      );

      if (!pacientes) {
        throw CustomError.badRequest("Paciente not found");
      }

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

  async findAll(): Promise<ReferenciaSignosVEntity[]> {
    try {
      // Busca todas las referencias de signos vitales no eliminadas
      const referencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      })
        .populate({
          path: "id_paciente", // Pobla el campo id_paciente
          model: PacientesModel, // Usa el modelo Paciente
          select: "id_usuario", // Selecciona solo el campo id_usuario del paciente
          populate: {
            path: "id_usuario", // Pobla el campo id_usuario del paciente
            model: UsuariosModel, // Usa el modelo Usuario
            select: "nombre apellido", // Selecciona solo nombre y apellido del usuario
          },
        })
        .exec();

      // Usa el mapper para transformar los objetos antes de retornarlos
      return ReferenciaSignosVMapper.referenciaSignosVAllEntitiesFromObjects(
        referencias
      );
    } catch (error) {
      console.error(
        "Error al buscar las referencias de signos vitales:",
        error
      );
      throw error;
    }
  }

  async findNotReferenciaSignosV(): Promise<NotReferenciaSignoVEntity[]> {
    try {
      // Obtener todas las referencias de signos vitales no eliminadas
      const referencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      })
        .select("id_paciente")
        .exec();

      // Obtener todos los pacientes
      const todosLosPacientes = await PacientesModel.find({ deletedAt: null })
        .populate({
          path: "id_usuario",
          model: UsuariosModel,
          select: "nombre apellido",
        })
        .exec();

      // Filtrar pacientes que NO tienen referencia en ReferenciaSignosVitalesModel
      const pacientesSinReferencia = todosLosPacientes.filter((paciente) => {
        return !referencias.some(
          (referencia) =>
            referencia.id_paciente.toString() === paciente._id.toString()
        );
      });

      console.log("pacientesSinReferencia");
      console.log("pacientesSinReferencia");
      console.log(pacientesSinReferencia);

      // Mapear pacientes sin referencia al formato adecuado
      return pacientesSinReferencia.map((paciente) => ({
        id: paciente._id.toString(),

        nombre: (paciente.id_usuario as any).nombre, // Valor predeterminado
        apellido: (paciente.id_usuario as any).apellido, // Valor predeterminado
        presion_arterial: "0", // Valor predeterminado
        frecuencia_cardiaca: "0", // Valor predeterminado
        frecuencia_respiratoria: "0", // Valor predeterminado
        temperatura: "0", // Valor predeterminado
        respiratorio: "0", // Valor predeterminado
        // Puedes agregar más campos si lo necesitas
      }));
    } catch (error) {
      console.error(
        "Error al buscar pacientes sin referencia de signos vitales:",
        error
      );
      throw error;
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

  async countAll(): Promise<CountResultReferenciaSignosV> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establecer la hora al inicio del día

      const count_referentes =
        await ReferenciaSignosVitalesModel.countDocuments({
          deletedAt: null,
        });

      const count_referentes_hoy =
        await ReferenciaSignosVitalesModel.countDocuments({
          deletedAt: null,
          createdAt: { $gte: hoy }, // Filtrar por la fecha de hoy
        });

      const referencias = await ReferenciaSignosVitalesModel.find({
        deletedAt: null,
      }).select("id_paciente");

      const totalPacientes = await PacientesModel.countDocuments({
        deletedAt: null,
      });

      const pacientesConReferencia = new Set(
        referencias.map((ref) => ref.id_paciente.toString())
      );

      const count_sin_referentes = totalPacientes - pacientesConReferencia.size;

      const combinedObject = {
        count_referentes,
        count_referentes_hoy,
        count_sin_referentes,
      };

      return ReferenciaSignosVMapper.referenteCountEntityFromObject(
        combinedObject
      );
    } catch (error) {
      console.error("Error al obtener el resumen de referencias de SV:", error);
      throw error;
    }
  }
}
