export class PacienteEntity {
  constructor(
    public id: string,
    public nombre?: string,
    public apellido?: string,
    public edad: number = 0,
    public genero?: string,
    public roles?: string,
    public signos_vitales?: string,
    public referenciaSV?: string,
    public status?: string,
    public id_centro_gerontologico?: string
  ) {}
}
export class CountResultPaciente {
  constructor(
    public count_pacientes: number,
    public count_paciente_hoy?: number,
    public count_masculino?: number,
    public count_femenino?: number
  ) {}
}
