import { CategoriasEntity } from "../entities/categorias.entity";

export abstract class CategoriasDatasource {
  abstract getCategoriasJson(): Promise<CategoriasEntity[]>;
}
