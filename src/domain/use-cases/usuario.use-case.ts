import { CustomError, JwtAdapter } from "../../infrastructure";
import { UserDto } from "../dtos/usuarios.dto";
import { UsuarioRepository } from "../repositories/usuarios.repository";

interface UserToken {
  token: unknown;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}
type SignToken = (payload: Object, duration?: string) => Promise<unknown>;

export class UsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(userDto: UserDto): Promise<any> {
    const user = await this.usuarioRepository.register(userDto);

    return user;
  }
  async countAllHOME(centroId: string): Promise<any> {
    return await this.usuarioRepository.countAllHOME(centroId);
  }
}
