import { BaseEntity } from "./base.entity";

export class CategoriasEntity extends BaseEntity {
  constructor(
    public id: string,
    public nombre: string,
    public descripcion?: string,
    public createdAt?: Date
  ) {
    super();
  }
}
