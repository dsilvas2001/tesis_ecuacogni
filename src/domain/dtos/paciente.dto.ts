export class PacienteDto {
  private constructor(
    public nombre: string,
    public apellido: string,
    public edad: number, // ← edad debe ser number
    public genero: string,
    public id_centro_gerontologico: string, // ← ObjectId como string
    public roles?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, PacienteDto?] {
    const { nombre, apellido, edad, genero, id_centro_gerontologico, roles } =
      object;

    // Validaciones básicas
    if (!nombre) return ["Missing name"];
    if (!apellido) return ["Missing apellido"];
    if (!edad) return ["Missing edad"];
    if (!genero) return ["Missing genero"];
    if (!id_centro_gerontologico) return ["Centro gerontológico es requerido"];

    if (!roles) return ["Missing rol"];

    return [
      undefined,
      new PacienteDto(
        nombre,
        apellido,
        edad,
        genero,
        id_centro_gerontologico,
        roles
      ),
    ];
  }
}
