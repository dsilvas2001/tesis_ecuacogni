import { UserDto } from "../dtos/usuarios.dto";
import { UserEntity } from "../entities/usuarios.entity";

export abstract class UsuarioDatasource {
  abstract register(userdto: UserDto): Promise<UserEntity>;

  // abstract findAll(): Promise<UserEntity[]>;

  abstract findByCredentials(
    email: string,
    password: string
  ): Promise<UserEntity>;

  abstract countAllHOME(): Promise<any>;

  // abstract update(userId: string, userUpdateDto: UserDto): Promise<UserEntity>;
  // abstract findById(userId: string): Promise<UserEntity>;
}
