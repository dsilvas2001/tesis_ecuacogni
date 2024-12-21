import {
  CategoriasDatasource,
  CategoriasEntity,
  CategoriasRepository,
} from "../../domain";

export class CategoriasRepositoryImpl implements CategoriasRepository {
  constructor(private readonly categoriasDatasource: CategoriasDatasource) {}

  async getCategoriasJson(): Promise<CategoriasEntity[]> {
    return this.categoriasDatasource.getCategoriasJson();
  }
}
