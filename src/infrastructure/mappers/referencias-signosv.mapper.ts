import {
  CountResultReferenciaSignosV,
  ReferenciaSignosVEntity,
} from "../../domain";
import { CustomError } from "../errors/custom.error";

export class ReferenciaSignosVMapper {
  static referenciaSignosVAllEntitiesFromObjects(
    objects: any[]
  ): ReferenciaSignosVEntity[] {
    return objects.map((object) => {
      const {
        _id,
        id_paciente,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
      } = object;

      // Validar si existe el paciente
      if (!id_paciente || !id_paciente.id_usuario) {
        throw new Error(
          "El objeto no tiene una referencia válida de paciente."
        );
      }

      // Extraer información del paciente
      const paciente = id_paciente.id_usuario;

      if (!paciente.nombre || !paciente.apellido) {
        throw new Error("El paciente debe tener nombre y apellido.");
      }

      // Crear la entidad con los datos extraídos
      return new ReferenciaSignosVEntity(
        id_paciente._id.toString(),
        paciente.nombre,
        paciente.apellido,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura
      );
    });
  }

  static referenteCountEntityFromObject(object: {
    [key: string]: any;
  }): CountResultReferenciaSignosV {
    const { count_referentes, count_referentes_hoy, count_sin_referentes } =
      object;

    // Validaciones básicas con mensajes de error claros
    if (count_referentes == null) {
      throw CustomError.badRequest(
        "Paciente entity requires an count_referentes"
      );
    }

    if (count_referentes_hoy == null) {
      throw CustomError.badRequest(
        "Paciente entity requires a count_referentes_hoy"
      );
    }
    if (count_sin_referentes == null) {
      throw CustomError.badRequest(
        "Paciente entity requires a count_sin_referentes"
      );
    }

    return new CountResultReferenciaSignosV(
      count_referentes,
      count_referentes_hoy,
      count_sin_referentes
    );
  }
}
