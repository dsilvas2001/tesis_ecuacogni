export class FuentesDto {
  private constructor(
    public _id?: string,
    public nombre?: string,
    public url?: string,
    public autor?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, FuentesDto?] {
    const { nombre, url, autor } = object;

    // Validaciones básicas
    if (!nombre) return ["Missing source name"];
    if (!url) return ["Missing URL"];
    if (!autor) return ["Missing authors"];

    return [undefined, new FuentesDto(undefined, nombre, url, autor)];
  }
}
