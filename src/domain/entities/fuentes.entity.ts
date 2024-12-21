import { BaseEntity } from "./base.entity";

export class FuentesEntity extends BaseEntity {
  constructor(
    public _id: string,
    public nombre: string,
    public url: string,
    public autor: string
  ) {
    super();
  }
}
