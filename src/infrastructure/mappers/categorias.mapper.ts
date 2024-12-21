import { CategoriasEntity } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class CategoriasMapper {
  static categoriaEntityFromObject(object: { [key: string]: any }) {
    const { _id, nombre, descripcion, createdAt } = object;

    if (!_id) {
      throw CustomError.badRequest("Missing id");
    }
    if (!nombre) {
      throw CustomError.badRequest("Missing nombre");
    }
    if (!descripcion) {
      throw CustomError.badRequest("Missing descripcion");
    }

    const categoriasEntity = new CategoriasEntity(_id, nombre, descripcion);

    categoriasEntity.createdAt = createdAt;

    return categoriasEntity;
  }
}
