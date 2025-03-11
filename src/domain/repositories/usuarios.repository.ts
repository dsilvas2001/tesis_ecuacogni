import { UserDto } from "../dtos/usuarios.dto";
import { UserEntity } from "../entities/usuarios.entity";

export abstract class UsuarioRepository {
  abstract register(userdto: UserDto): Promise<UserEntity>;
  abstract findByCredentials(
    email: string,
    password: string
  ): Promise<UserEntity>;

  abstract countAllHOME(): Promise<any>;
}
