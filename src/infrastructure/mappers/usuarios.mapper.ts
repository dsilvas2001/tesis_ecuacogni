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
    const { _id, nombre, apellido, experiencia_anios, email, rolName } = object;

    // Validaciones básicas con mensajes de error claros
    if (!nombre) {
      throw CustomError.badRequest("User entity requires a name");
    }
    if (!apellido) {
      throw CustomError.badRequest("User entity requires a apellido");
    }

    if (!email) {
      throw CustomError.badRequest("User entity requires an email");
    }

    // Crear y devolver la entidad de usuario
    return new UserEntity(
      _id.toString(),
      nombre,
      apellido,
      experiencia_anios,
      email,
      "",
      rolName
    );
  }
}
