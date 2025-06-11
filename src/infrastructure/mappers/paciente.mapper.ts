import { CountResultPaciente, PacienteEntity } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class PacienteMapper {
  static pacienteEntityFromObject(object: {
    [key: string]: any;
  }): PacienteEntity {
    const {
      _id,
      nombre,
      apellido,
      edad,
      genero,
      id_centro_gerontologico,
      id_rol,
    } = object;

    // Validaciones básicas con mensajes de error claros
    if (!_id) {
      throw CustomError.badRequest("Paciente entity requires an ID");
    }
    if (!nombre) {
      throw CustomError.badRequest("Paciente entity requires a name");
    }
    if (!apellido) {
      throw CustomError.badRequest("Paciente entity requires a apellido");
    }
    if (!edad) {
      throw CustomError.badRequest("Paciente entity requires a edad");
    }
    if (!genero) {
      throw CustomError.badRequest("Paciente entity requires an genero");
    }
    if (!id_rol) {
      throw CustomError.badRequest("Paciente entity requires roles");
    }
    // Crear y devolver la entidad de usuario
    return new PacienteEntity(
      _id.toString(),
      nombre,
      apellido,
      edad,
      genero,
      id_rol.toString()
    );
  }
  static pacienteCountEntityFromObject(object: {
    [key: string]: any;
  }): CountResultPaciente {
    const {
      count_pacientes,
      count_paciente_hoy,
      count_masculino,
      count_femenino,
    } = object;

    // Validaciones básicas con mensajes de error claros
    if (count_pacientes == null) {
      throw CustomError.badRequest(
        "Paciente entity requires an count_pacientes"
      );
    }

    if (count_paciente_hoy == null) {
      throw CustomError.badRequest(
        "Paciente entity requires a count_paciente_hoy"
      );
    }
    if (count_masculino == null) {
      throw CustomError.badRequest(
        "Paciente entity requires a count_masculino"
      );
    }
    if (!count_femenino == null) {
      throw CustomError.badRequest("Paciente entity requires a count_femenino");
    }

    return new CountResultPaciente(
      count_pacientes,
      count_paciente_hoy,
      count_masculino,
      count_femenino
    );
  }

  static pacienteAllEntitiesFromObjects(objects: any[]): PacienteEntity[] {
    return objects.map((object) => {
      const { _id, nombre, apellido, edad, genero, signos_vitales } = object;

      // Validaciones básicas con mensajes de error claros
      if (!_id) {
        throw new Error("Paciente entity requires an ID");
      }
      if (!nombre) {
        throw new Error("Paciente entity requires a name");
      }
      if (!apellido) {
        throw new Error("Paciente entity requires an apellido");
      }
      if (!edad) {
        throw new Error("Paciente entity requires a edad");
      }
      if (!genero) {
        throw new Error("Paciente entity requires an genero");
      }

      // Crear y devolver la entidad
      return new PacienteEntity(
        _id.toString(),
        nombre,
        apellido,
        edad,
        genero,
        signos_vitales
      );
    });
  }
}
