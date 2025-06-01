export abstract class EjercicioResultadoDatasource {
  abstract registerEjercicio(ejercicioResultado: any): Promise<any[]>;

  abstract getEjercicio(id_paciente: any): Promise<any>;
}
