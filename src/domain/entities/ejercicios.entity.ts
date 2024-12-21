import { BaseEntity } from "./base.entity";

export class EjercicioEntity extends BaseEntity {
  constructor(
    public id: string,
    public titulo: string,
    public descripcion: string,
    public duracion: number,
    public dificultad: string,
    public categoriaId: string[],
    public fuenteId: string
  ) {
    super();
  }
}
