import { EjercicioEntity } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class ScraperGeneralMapper {
  static scraperGeneralEntityFromObject(object: { [key: string]: any }) {
    const {
      _id,
      titulo,
      descripcion,
      duracion,
      dificultad,
      categoriaId,
      fuenteId,
      createdAt,
    } = object;

    if (!_id) {
      throw CustomError.badRequest("Missing id");
    }
    if (!titulo) {
      throw CustomError.badRequest("Missing titulo");
    }
    if (!descripcion) {
      throw CustomError.badRequest("Missing descripcion");
    }
    if (!duracion) {
      throw CustomError.badRequest("Missing duracion");
    }
    if (!dificultad) {
      throw CustomError.badRequest("Missing dificultad");
    }
    if (!categoriaId) {
      throw CustomError.badRequest("Missing categoriaId");
    }
    if (!categoriaId) {
      throw CustomError.badRequest("Missing categoriaId");
    }
    if (!fuenteId) {
      throw CustomError.badRequest("Missing fuenteId");
    }

    const ejercicioEntity = new EjercicioEntity(
      _id,
      titulo,
      descripcion,
      duracion,
      dificultad,
      categoriaId,
      fuenteId
    );

    ejercicioEntity.createdAt = createdAt;

    return ejercicioEntity;
  }
}
