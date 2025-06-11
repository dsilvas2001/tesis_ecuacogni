export class CrearCentroDto {
  private constructor(
    public nombre: string,
    public direccion: string,
    public id_administrador: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CrearCentroDto?] {
    const { nombre, direccion, id_administrador } = object;

    if (!nombre) return ["Nombre del centro es requerido"];
    if (!direccion) return ["Dirección del centro es requerida"];
    if (!id_administrador) return ["ID de administrador es requerido"];

    return [undefined, new CrearCentroDto(nombre, direccion, id_administrador)];
  }
}
export class UnirseCentroDto {
  private constructor(
    public id_usuario: string,
    public codigo_centro: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UnirseCentroDto?] {
    const { id_usuario, codigo_centro } = object;

    if (!id_usuario) return ["ID de usuario es requerido"];
    if (!codigo_centro) return ["Código de centro es requerido"];

    return [undefined, new UnirseCentroDto(id_usuario, codigo_centro)];
  }
}
