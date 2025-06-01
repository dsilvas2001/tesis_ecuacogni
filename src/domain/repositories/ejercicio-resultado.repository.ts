export abstract class EjercicioResultadoRepository {
  abstract registerEjercicio(ejercicioResultado: any): Promise<any[]>;

  abstract getEjercicio(id_paciente: any): Promise<any>;
}
