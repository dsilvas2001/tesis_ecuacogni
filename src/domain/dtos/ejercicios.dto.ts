import { CategoriasDto } from "./categorias.dto";
import { FuentesDto } from "./fuentes.dto";

export class EjercicioDto {
  private constructor(
    public id?: string,
    public titulo?: string,
    public descripcion?: string,
    public categoria?: CategoriasDto[],
    public fuente?: FuentesDto[],
    public duracion?: number,
    public dificultad?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, EjercicioDto?] {
    const { id, titulo, descripcion, categoria, fuente, duracion, dificultad } =
      object;

    // Validaciones básicas
    if (!id) return ["Missing exercise ID"];
    if (!titulo) return ["Missing exercise title"];
    // if (!descripcion) return ["Missing exercise description"];
    if (typeof duracion !== "number") return ["Duration must be a number"];
    // if (!dificultad) return ["Missing exercise difficulty"];
    return [
      undefined,
      new EjercicioDto(
        id,
        titulo,
        descripcion,
        categoria,
        fuente,
        duracion,
        dificultad
      ),
    ];
  }
}
