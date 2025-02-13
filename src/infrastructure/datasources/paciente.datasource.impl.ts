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

export class PacienteDatasourceImpl implements PacienteDatasource {
  constructor() {}

  /**
   *
   * @param userDto
   * @returns
   */
  async register(pacienteDto: PacienteDto): Promise<PacienteEntity> {
    const { nombre, apellido, edad, genero, roles } = pacienteDto;
    try {
      // Buscar el rol basado en el nombre del rol
      const role = await RolesModel.findOne({ rolName: roles });
      if (!role) throw CustomError.badRequest("Role not found");

      // Crear el nuevo usuario con el rol y el curso
      const user = await UsuariosModel.create({
        nombre: nombre,
        apellido: apellido,
        id_rol: role._id,
      });
      const paciente = await PacientesModel.create({
        id_usuario: user.id,
        genero: genero,
        edad: edad,
      });
      const combinedObject = {
        ...user.toObject(),
        ...paciente.toObject(),
      };

      // Devolver la entidad de usuario creada
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

  /**
   *
   * @returns
   */

  async findAll(): Promise<PacienteEntity[]> {
    // Buscar pacientes activos y poblar el usuario relacionado
    const pacientes = await PacientesModel.find({ deletedAt: null })
      .populate({
        path: "id_usuario", // Campo a popular
        model: UsuariosModel, // Modelo de referencia
        match: { deletedAt: null }, // Solo usuarios activos
        select: "nombre apellido", // Campos específicos a traer
      })
      .lean(); // Devuelve datos planos en lugar de documentos de Mongoose

    const pacientesEntities: PacienteEntity[] = [];

    for (const paciente of pacientes) {
      // Verificar si `id_usuario` es un ObjectId o un objeto poblado
      const usuario = paciente.id_usuario as
        | { nombre: string; apellido: string }
        | Types.ObjectId;

      if (!usuario || usuario instanceof mongoose.Types.ObjectId) {
        throw `Paciente con ID ${paciente._id} no tiene un usuario válido asociado o no fue poblado correctamente.`;
      }

      // Verificar estado de los signos vitales
      const signosVitales = await SignosVitalesModel.findOne({
        id_paciente: paciente._id,
        deletedAt: null,
      })
        .sort({ updatedAt: -1 })
        .lean();

      let signos_vitales = "Pendiente"; // Estado predeterminado
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
      let referencia_SV = "Pendiente";

      referencia_SV = referenciaSV?.updatedAt ? "Registrado" : "Pendiente";

      // Crear la entidad PacienteEntity
      pacientesEntities.push(
        new PacienteEntity(
          paciente._id.toString(),
          usuario.nombre, // Ahora sabemos que `usuario` tiene nombre y apellido
          usuario.apellido,
          paciente.edad,
          paciente.genero,
          "Paciente", // Roles no especificados
          signos_vitales,
          referencia_SV
        )
      );
    }

    return pacientesEntities;
  }

  async countAll(): Promise<CountResultPaciente> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Hacer las consultas, y asignar 0 en caso de que no haya resultados
    const count_pacientes =
      (await PacientesModel.countDocuments({ deletedAt: null })) || 0; // Total de pacientes activos

    const count_masculino =
      (await PacientesModel.countDocuments({
        genero: "Masculino",
        deletedAt: null,
      })) || 0; // Total de pacientes masculinos activos

    const count_femenino =
      (await PacientesModel.countDocuments({
        genero: "Femenino",
        deletedAt: null,
      })) || 0; // Total de pacientes femeninos activos

    const count_paciente_hoy =
      (await PacientesModel.countDocuments({
        createdAt: { $gte: startOfDay },
      })) || 0;

    const combinedObject = {
      count_pacientes,
      count_paciente_hoy,
      count_masculino,
      count_femenino,
    };
    console.log(combinedObject);

    return PacienteMapper.pacienteCountEntityFromObject(combinedObject);
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
