import { SignosVitalesDto } from "../dtos/signos-vitales.dto";

export abstract class EjercicioPacienteDataSource {
  abstract findAll(
    fechaSeleccionada: string,
    estadoEjercicio: "completo" | "incompleto" | "pendiente" | "todos"
  ): Promise<any[]>;

  abstract countAll(): Promise<any>;

  abstract selectCategoria(signosVitalesDto: SignosVitalesDto): Promise<any>;
}
