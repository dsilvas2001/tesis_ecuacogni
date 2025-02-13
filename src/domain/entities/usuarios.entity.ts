export class UserEntity {
  constructor(
    public id: string,
    public nombre?: string,
    public apellido?: string,
    public experiencia_anios: number = 0,
    public email?: string,
    public password?: string,
    public roles?: string,
    public status?: string
  ) {}
}
