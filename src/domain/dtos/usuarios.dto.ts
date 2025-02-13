export class UserDto {
  private constructor(
    public nombre: string,
    public apellido: string,
    public experiencia_anios: string,
    public email: string,
    public password?: string,
    public roles?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UserDto?] {
    const { nombre, apellido, experiencia_anios, email, password, roles } =
      object;

    // Validaciones básicas
    if (!nombre) return ["Missing name"];
    if (!apellido) return ["Missing apellido"];
    if (!experiencia_anios) return ["Missing experiencia_anios"];
    if (!email) return ["Missing email"];
    if (!password) return ["Missing password"];
    if (!roles) return ["Missing rol"];
    if (password.length < 4) return ["Password too short"];

    return [
      undefined,
      new UserDto(nombre, apellido, experiencia_anios, email, password, roles),
    ];
  }
}
