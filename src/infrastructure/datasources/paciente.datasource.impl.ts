import mongoose, { Types } from "mongoose";
import {
  PacientesModel,
  ReferenciaSignosVitalesModel,
  RolesModel,
  SignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import {
  CountResultPaciente,
  PacienteDatasource,
  PacienteDto,
  PacienteEntity,
} from "../../domain";
import { CustomError } from "../errors/custom.error";
import { PacienteMapper } from "../mappers/paciente.mapper";
import { CentroGerontologicoModel } from "../../data/mongodb/models/centro-gerontologico.model";

export class PacienteDatasourceImpl implements PacienteDatasource {
  constructor() {}

  /**
   *
   * @param userDto
   * @returns
   */
  async register(pacienteDto: PacienteDto): Promise<PacienteEntity> {
    const { nombre, apellido, edad, genero, id_centro_gerontologico, roles } =
      pacienteDto;

    try {
      // ✅ Validar formato del ID del centro gerontológico
      if (!mongoose.Types.ObjectId.isValid(id_centro_gerontologico)) {
        throw CustomError.badRequest(
          "ID del centro gerontológico inválido. Se esperaba un ObjectId válido."
        );
      }

      // ✅ Verificar existencia del centro
      const centro = await CentroGerontologicoModel.findById(
        id_centro_gerontologico
      );
      if (!centro) {
        throw CustomError.badRequest("Centro gerontológico no encontrado.");
      }

      // ✅ Verificar existencia del rol
      const role = await RolesModel.findOne({ rolName: roles });
      if (!role) {
        throw CustomError.badRequest(`Rol "${roles}" no encontrado.`);
      }

      // ✅ Crear usuario con rol y centro asignado
      const user = await UsuariosModel.create({
        nombre,
        apellido,
        id_rol: role._id,
        id_centro_gerontologico: centro._id,
      });

      // ✅ Crear entidad paciente asociada al usuario
      const paciente = await PacientesModel.create({
        id_usuario: user._id,
        genero,
        edad,
      });

      // ✅ Combinar datos del usuario y paciente
      const combinedObject = {
        ...user.toObject(),
        ...paciente.toObject(),
      };

      // ✅ Mapear y retornar la entidad final
      return PacienteMapper.pacienteEntityFromObject(combinedObject);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else if (error instanceof mongoose.Error) {
        throw CustomError.serverUnavailable(
          `Error de base de datos: ${error.message}`
        );
      } else {
        throw CustomError.internalServer();
      }
    }
  }

  /**
   *
   * @returns
   */

  async findAll(centroId: string): Promise<PacienteEntity[]> {
    // Construir query base
    const query: any = { deletedAt: null };

    // Configurar opciones de populate
    const populateOptions: any = {
      path: "id_usuario",
      model: UsuariosModel,
      match: { deletedAt: null },
      select: "nombre apellido id_centro_gerontologico",
    };

    // Si se proporciona un centroId, filtrar por ese centro
    if (centroId) {
      populateOptions.match.id_centro_gerontologico =
        new mongoose.Types.ObjectId(centroId);
    }

    // Buscar pacientes con el filtro aplicado
    const pacientes = await PacientesModel.find(query)
      .populate(populateOptions)
      .lean();

    const pacientesEntities: PacienteEntity[] = [];

    for (const paciente of pacientes) {
      // Verificar si el usuario fue poblado correctamente
      const usuario = paciente.id_usuario as
        | {
            nombre: string;
            apellido: string;
            id_centro_gerontologico?: mongoose.Types.ObjectId;
          }
        | mongoose.Types.ObjectId;

      // Si no hay usuario o no está poblado, saltar este paciente
      if (!usuario || usuario instanceof mongoose.Types.ObjectId) {
        continue; // O usar throw si prefieres manejar como error
      }

      // Si se filtró por centro y el usuario no pertenece, saltar
      if (
        centroId &&
        (!usuario.id_centro_gerontologico ||
          usuario.id_centro_gerontologico.toString() !== centroId)
      ) {
        continue;
      }

      // Resto de la lógica para signos vitales...
      const signosVitales = await SignosVitalesModel.findOne({
        id_paciente: paciente._id,
        deletedAt: null,
      })
        .sort({ updatedAt: -1 })
        .lean();

      let signos_vitales = "Pendiente";
      if (signosVitales?.updatedAt) {
        const today = new Date().toDateString();
        const updatedDate = new Date(signosVitales.updatedAt).toDateString();
        signos_vitales = today === updatedDate ? "Actualizado" : "Pendiente";
      }

      const referenciaSV = await ReferenciaSignosVitalesModel.findOne({
        id_paciente: paciente._id,
        deletedAt: null,
      })
        .sort({ updatedAt: -1 })
        .lean();

      const referencia_SV = referenciaSV?.updatedAt
        ? "Registrado"
        : "Pendiente";

      pacientesEntities.push(
        new PacienteEntity(
          paciente._id.toString(),
          usuario.nombre,
          usuario.apellido,
          paciente.edad,
          paciente.genero,
          "Paciente",
          signos_vitales,
          referencia_SV
        )
      );
    }

    return pacientesEntities;
  }

  async countAll(centroId: string): Promise<CountResultPaciente> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Construir query base
    const baseQuery: any = { deletedAt: null };
    const usuarioQuery: any = { deletedAt: null };

    // Si se proporciona un centroId, filtrar por ese centro
    if (centroId) {
      usuarioQuery.id_centro_gerontologico = new mongoose.Types.ObjectId(
        centroId
      );
    }

    // Obtener IDs de usuarios que pertenecen al centro (si se especificó)
    const usuariosFiltrados = centroId
      ? await UsuariosModel.find(usuarioQuery).select("_id").lean()
      : null;

    // Aplicar filtro por usuarios si hay centroId
    if (usuariosFiltrados) {
      baseQuery.id_usuario = { $in: usuariosFiltrados.map((u) => u._id) };
    }

    // Realizar las consultas
    const count_pacientes = await PacientesModel.countDocuments(baseQuery);
    const count_paciente_hoy = await PacientesModel.countDocuments({
      ...baseQuery,
      createdAt: { $gte: startOfDay },
    });
    const count_masculino = await PacientesModel.countDocuments({
      ...baseQuery,
      genero: "Masculino",
    });
    const count_femenino = await PacientesModel.countDocuments({
      ...baseQuery,
      genero: "Femenino",
    });

    return new CountResultPaciente(
      count_pacientes,
      count_paciente_hoy,
      count_masculino,
      count_femenino
    );
  }

  async update(
    pacienteId: string,
    updateDto: PacienteDto
  ): Promise<PacienteEntity> {
    const { nombre, apellido, edad, genero } = updateDto;
    try {
      // Buscar el usuario y paciente a actualizar
      const pacientes = await PacientesModel.findById(pacienteId);
      if (!pacientes) throw CustomError.badRequest("Paciente not found");

      const usuario = await UsuariosModel.findById({
        _id: pacientes.id_usuario,
      });
      if (!usuario) throw CustomError.badRequest("Usuario not found");

      // Actualizar los campos del usuario
      usuario.nombre = nombre;
      usuario.apellido = apellido;
      await usuario.save();

      // Actualizar los campos del paciente
      pacientes.edad = edad;
      if (genero !== "Masculino" && genero !== "Femenino") {
        throw CustomError.badRequest("Invalid gender value");
      }
      pacientes.genero = genero;
      await pacientes.save();

      const combinedObject = {
        ...usuario.toObject(),
        ...pacientes.toObject(),
      };

      // Devolver la entidad de usuario actualizada
      return PacienteMapper.pacienteEntityFromObject(combinedObject);
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

  async delete(pacienteId: string): Promise<string> {
    // Buscar el usuario y paciente a actualizar
    const pacientes = await PacientesModel.findById(pacienteId);

    if (!pacientes) throw CustomError.badRequest("Paciente not found");

    const usuario = await UsuariosModel.findOne({ _id: pacientes.id_usuario });
    if (!usuario) throw CustomError.badRequest("Usuario not found");

    // Actualizar el campo deletedAt con la fecha actual
    const deletedAt = new Date();

    await PacientesModel.findByIdAndUpdate(pacienteId, { deletedAt });
    await UsuariosModel.findByIdAndUpdate(usuario.id, { deletedAt });

    return "Paciente eliminado correctamente";
  }
}
