import { SignosVitalesEntity } from "../../domain";

export class SignosVitalesMapper {
  static signosVitalesAllEntitiesFromObjects(
    objects: any[]
  ): SignosVitalesEntity[] {
    return objects.map((object) => {
      const {
        _id,
        id_paciente,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        analisis_ia,
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
      return new SignosVitalesEntity(
        id_paciente._id.toString(),
        paciente.nombre,
        paciente.apellido,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        analisis_ia
      );
    });
  }
  static idSignosVitalesAllEntitiesFromObjects(
    objects: any[]
  ): SignosVitalesEntity[] {
    return objects.map((object) => {
      const {
        _id,
        id_paciente,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        analisis_ia,
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
      return new SignosVitalesEntity(
        id_paciente._id.toString(),
        paciente.nombre,
        paciente.apellido,
        presion_arterial,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        analisis_ia
      );
    });
  }
}
