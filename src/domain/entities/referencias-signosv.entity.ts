export class ReferenciaSignosVEntity {
  constructor(
    public id: string,
    public nombre?: string,
    public apellido?: string,
    public presion_arterial?: {
      sistolica_min: number;
      sistolica_max: number;
      diastolica_min: number;
      diastolica_max: number;
    },
    public frecuencia_cardiaca?: {
      min: number;
      max: number;
    },
    public frecuencia_respiratoria?: {
      min: number;
      max: number;
    },
    public temperatura?: {
      min: number;
      max: number;
    },
    public deletedAt?: Date
  ) {}
}

export class NotReferenciaSignoVEntity {
  constructor(
    public id: string,
    public nombre?: string,
    public apellido?: string,
    public presion_arterial?: string,
    public frecuencia_cardiaca?: string,
    public frecuencia_respiratoria?: string,
    public temperatura?: string,
    public deletedAt?: Date
  ) {}
}

export class CountResultReferenciaSignosV {
  constructor(
    public count_referentes: number,
    public count_referentes_hoy?: number,
    public count_sin_referentes?: number
  ) {}
}
