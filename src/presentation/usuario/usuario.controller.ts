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

      // Generar el token JWT
      const token = await JwtAdapter.generateToken({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.roles,
      });
      console.log("User Object:", user);

      res.status(200).json({
        email: user.email,
        token,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
