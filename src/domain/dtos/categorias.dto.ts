export class CategoriasDto {
  private constructor(
    public id?: string,
    public nombre?: string,
    public descripcion?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CategoriasDto?] {
    const { nombre, descripcion } = object;

    // Validaciones básicas
    if (!nombre) return ["Missing category name"];
    if (!descripcion) return ["Missing category descripcion"];

    return [undefined, new CategoriasDto(undefined, nombre, descripcion)];
  }
}
