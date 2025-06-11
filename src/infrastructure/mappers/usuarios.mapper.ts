import { UserEntity } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class UsuarioMapper {
  static userEntityFromObject(object: { [key: string]: any }): UserEntity {
    const {
      _id,
      nombre,
      apellido,
      experiencia_anios,
      email,
      password,
      id_rol,
    } = object;

    // Validaciones básicas con mensajes de error claros
    if (!_id) {
      throw CustomError.badRequest("User entity requires an ID");
    }
    if (!nombre) {
      throw CustomError.badRequest("User entity requires a name");
    }
    if (!apellido) {
      throw CustomError.badRequest("User entity requires a apellido");
    }
    if (!experiencia_anios) {
      throw CustomError.badRequest("User entity requires a experiencia_anios");
    }
    if (!email) {
      throw CustomError.badRequest("User entity requires an email");
    }
    if (!password) {
      throw CustomError.badRequest("User entity requires a password");
    }
    if (!id_rol) {
      throw CustomError.badRequest("User entity requires roles");
    }
    // Crear y devolver la entidad de usuario
    return new UserEntity(
      _id.toString(),
      nombre,
      apellido,
      experiencia_anios,
      email,
      password,
      id_rol.toString()
    );
  }
  static userAuthEntityFromObject(object: { [key: string]: any }): UserEntity {
    const {
      _id, // ID del usuario (de UsuariosModel)
      id_rol, // ID del rol (de UsuariosModel)
      nombre,
      apellido,
      email,
      rolName, // Nombre del rol (de RolesModel)
      experiencia_anios = 0,
      id_centro_gerontologico,
      es_administrador = false,
      centro_info,
    } = object;

    // Validaciones básicas con mensajes de error claros
    if (!_id) throw CustomError.badRequest("User entity requires an ID");
    if (!nombre) throw CustomError.badRequest("User entity requires a name");
    if (!apellido)
      throw CustomError.badRequest("User entity requires an apellido");
    if (!email) throw CustomError.badRequest("User entity requires an email");
    if (!rolName) throw CustomError.badRequest("User entity requires a role");

    // Calcular si tiene centro asignado
    const tieneCentroAsignado = !!id_centro_gerontologico;

    // Crear y devolver la entidad de usuario
    return new UserEntity(
      _id.toString(), // ID del usuario
      nombre,
      apellido,
      email,
      "", // password no se incluye en la respuesta
      rolName,
      "active", // status por defecto
      experiencia_anios,
      es_administrador,
      !!id_centro_gerontologico,
      centro_info
        ? {
            id: centro_info._id?.toString() || centro_info.id,
            nombre: centro_info.nombre,
            direccion: centro_info.direccion,
            codigo_unico: centro_info.codigo_unico,
          }
        : null
    );
  }
}
