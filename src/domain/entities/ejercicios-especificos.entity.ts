import { BaseEntity } from "./base.entity";

export class EjercicioEspecificoEntity extends BaseEntity {
  constructor(
    public id: string,
    public ejercicioId: string,
    public condicionEspecifica: string,
    public signoVitalRelevante: string,
    public rangoIdeal: string,
    public recomendaciones: string,
    public observaciones: string
  ) {
    super();
  }
}
