import { FuentesEntity } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class FuentesMapper {
  static fuenteEntityFromObject(object: { [key: string]: any }) {
    const { _id, nombre, url, autor, createdAt } = object;

    if (!_id) {
      throw CustomError.badRequest("Missing _id");
    }
    if (!nombre) {
      throw CustomError.badRequest("Missing nombre");
    }
    if (!url) {
      throw CustomError.badRequest("Missing url");
    }
    if (!autor) {
      throw CustomError.badRequest("Missing autor");
    }

    const fuenteEntity = new FuentesEntity(_id, nombre, url, autor);

    fuenteEntity.createdAt = createdAt;

    return fuenteEntity;
  }
}
