// export class UserEntity {
//   constructor(
//     public id: string,
//     public nombre?: string,
//     public apellido?: string,
//     public experiencia_anios: number = 0,
//     public email?: string,
//     public password?: string,
//     public roles?: string,
//     public status?: string
//   ) {}
// }

// export class UserEntity {
//   constructor(
//     public id: string,
//     public nombre?: string,
//     public apellido?: string,
//     public email?: string,
//     public password?: string,
//     public roles?: string,
//     public status?: string,
//     public experiencia_anios: number = 0,
//     public es_administrador: boolean = false,
//     public tiene_centro_asignado: boolean = false, // Nuevo campo
//     public centro_info?: {
//       // Nuevo campo opcional
//       id: string;
//       nombre: string;
//       direccion: string;
//       codigo_unico: string;
//     } | null
//   ) {}
// }

export class UserEntity {
  constructor(
    public id: string, // ID del usuario
    public nombre?: string,
    public apellido?: string,
    public email?: string,
    public password?: string,
    public roles?: string, // Nombre del rol
    public status?: string,
    public experiencia_anios: number = 0,
    public es_administrador: boolean = false,
    public tiene_centro_asignado: boolean = false,
    public centro_info?: {
      id: string;
      nombre: string;
      direccion: string;
      codigo_unico: string;
    } | null,
    public id_rol?: string // Nuevo: ID del rol
  ) {}
}
