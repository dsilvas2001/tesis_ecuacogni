import { CategoriasEntity } from "../entities/categorias.entity";

export abstract class CategoriasRepository {
  abstract getCategoriasJson(): Promise<CategoriasEntity[]>;
}
