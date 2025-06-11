import {
  UserDto,
  UserEntity,
  UsuarioDatasource,
  UsuarioRepository,
} from "../../domain";

export class UsuarioRepositoryImpl implements UsuarioRepository {
  constructor(private readonly usuarioDatasource: UsuarioDatasource) {}

  async register(userDto: UserDto): Promise<UserEntity> {
    return this.usuarioDatasource.register(userDto);
  }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<UserEntity> {
    return await this.usuarioDatasource.findByCredentials(email, password);
  }
  async countAllHOME(centroId: string): Promise<any> {
    return await this.usuarioDatasource.countAllHOME(centroId);
  }
}
