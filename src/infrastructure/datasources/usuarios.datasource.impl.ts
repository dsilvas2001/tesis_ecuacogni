import {
  MedicosModel,
  RolesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import { UserDto, UserEntity, UsuarioDatasource } from "../../domain";
import { CustomError } from "../errors/custom.error";
import { UsuarioMapper } from "../mappers/usuarios.mapper";
import { BcryptAdapter } from "../security/bcrypt.security";

type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;

export class UsuarioDatasourceImpl implements UsuarioDatasource {
  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: CompareFunction = BcryptAdapter.compare
  ) {}

  /**
   *
   * @param userDto
   * @returns
   */
  async register(userDto: UserDto): Promise<UserEntity> {
    const { nombre, apellido, experiencia_anios, email, password, roles } =
      userDto;
    try {
      // Verificar si el correo existe
      const exists = await UsuariosModel.findOne({ email });
      if (exists) throw CustomError.badRequest("email already exists");

      // Buscar el rol basado en el nombre del rol
      const role = await RolesModel.findOne({ rolName: roles });
      if (!role) throw CustomError.badRequest("Role not found");

      // Crear el nuevo usuario con el rol y el curso
      const user = await UsuariosModel.create({
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: this.hashPassword(password!),
        id_rol: role._id,
      });
      const medico = await MedicosModel.create({
        id_usuario: user.id,
        experiencia_anios: experiencia_anios,
      });
      const combinedObject = {
        ...user.toObject(), // Convierte el documento de Mongoose en un objeto JavaScript
        ...medico.toObject(), // Convierte el segundo documento en un objeto JavaScript
      };

      // Devolver la entidad de usuario creada
      return UsuarioMapper.userEntityFromObject(combinedObject);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<UserEntity> {
    try {
      // Buscar al usuario por el correo electrónico
      const user = await UsuariosModel.findOne({ email });

      if (!user) {
        throw CustomError.badRequest("Invalid credentials");
      }

      const role = await RolesModel.findById(user.id_rol);
      console.log("role");
      console.log("role");
      console.log(role);

      // Comparar la contraseña proporcionada con la almacenada
      const isPasswordValid = this.comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw CustomError.badRequest("Invalid credentials");
      }

      const combinedObject = {
        ...user.toObject(), // Convierte el documento de Mongoose en un objeto JavaScript
        ...role!.toObject(), // Convierte el segundo documento en un objeto JavaScript
      };
      console.log("combinedObject");
      console.log("combinedObject");
      console.log(combinedObject);

      // Si las credenciales son válidas, devolver el usuario
      return UsuarioMapper.userAuthEntityFromObject(combinedObject);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw CustomError.internalServer();
      }
    }
  }
}
