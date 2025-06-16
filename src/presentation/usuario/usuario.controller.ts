import { Request, Response } from "express";
import { UserDto, UsuarioRepository, UsuarioUseCase } from "../../domain";
import { CustomError, JwtAdapter } from "../../infrastructure";

export class UsuarioController {
  constructor(private readonly userRepository: UsuarioRepository) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statuscode).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  };
  /**
   *
   * @param req
   * @param res
   * @returns
   */
  registerUser = async (req: Request, res: Response): Promise<void> => {
    const [error, userDto] = UserDto.create(req.body);

    if (error) {
      res.status(400).json({ error });
      return;
    }
    new UsuarioUseCase(this.userRepository)
      .execute(userDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  findByCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.userRepository.findByCredentials(email, password);

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Generar token con ambos IDs
      const token = await JwtAdapter.generateToken({
        id: user.id, // ID del usuario
        id_rol: user.id_rol, // ID del rol
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: user.password, // No deberías enviar la contraseña en el token
        rol: user.roles, // Nombre del rol
        tiene_centro_asignado: user.tiene_centro_asignado,
        es_administrador: user.es_administrador,
        centro_info: user.centro_info,
      });

      res.status(200).json({
        user: {
          id: user.id, // ID del usuario
          id_rol: user.id_rol, // ID del rol
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          password: user.password, // No deberías enviar la contraseña en el token
          rol: user.roles, // Nombre del rol
          experiencia_anios: user.experiencia_anios,
          tiene_centro_asignado: user.tiene_centro_asignado,
          es_administrador: user.es_administrador,
          centro_info: user.centro_info,
        },
        token,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getCountAllHOME = async (req: Request, res: Response): Promise<void> => {
    new UsuarioUseCase(this.userRepository)
      .countAllHOME(req.params.centroId)
      .then((data) => res.status(200).json(data))
      .catch((error) => this.handleError(error, res));
  };
}
