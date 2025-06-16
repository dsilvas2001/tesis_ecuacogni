import mongoose from "mongoose";
import {
  MedicosModel,
  PacienteEjerciciosModel,
  PacientesModel,
  RolesModel,
  SignosVitalesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import { CentroGerontologicoModel } from "../../data/mongodb/models/centro-gerontologico.model";
import { EjercicioResultadosModel } from "../../data/mongodb/models/ejercicio-resultado.model";
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

  // async findByCredentials(
  //   email: string,
  //   password: string
  // ): Promise<UserEntity> {
  //   try {
  //     // Buscar al usuario por el correo electrónico
  //     const user = await UsuariosModel.findOne({ email });

  //     if (!user) {
  //       throw CustomError.badRequest("Credenciales inválidas");
  //     }

  //     // Comparar la contraseña
  //     const isPasswordValid = this.comparePassword(password, user.password);
  //     if (!isPasswordValid) {
  //       throw CustomError.badRequest("Credenciales inválidas");
  //     }

  //     // Obtener información adicional en paralelo
  //     const [role, centro] = await Promise.all([
  //       RolesModel.findById(user.id_rol),
  //       user.id_centro_gerontologico
  //         ? CentroGerontologicoModel.findById(user.id_centro_gerontologico)
  //         : Promise.resolve(null),
  //     ]);

  //     if (!role) {
  //       throw CustomError.internalServer("Rol no encontrado");
  //     }
  //     console.log("user");
  //     console.log("user");
  //     console.log(user);

  //     // Construir el objeto combinado
  //     const combinedObject = {
  //       ...user.toObject(),
  //       rolName: role.rolName, // Solo el nombre del rol
  //       tiene_centro_asignado: !!user.id_centro_gerontologico,
  //       centro_info: centro
  //         ? {
  //             id: centro._id,
  //             nombre: centro.nombre,
  //             direccion: centro.direccion,
  //             codigo_unico: centro.codigo_unico,
  //           }
  //         : null,
  //     };

  //     // Asegurar los IDs correctos
  //     combinedObject._id = user._id;
  //     combinedObject.id_rol = user.id_rol;

  //     return UsuarioMapper.userAuthEntityFromObject(combinedObject);
  //     console.log("combinedObject");
  //     console.log("combinedObject");
  //     console.log("combinedObject");
  //     console.log(combinedObject);

  //     return UsuarioMapper.userAuthEntityFromObject(combinedObject);
  //   } catch (error) {
  //     if (error instanceof CustomError) {
  //       throw error;
  //     }
  //     console.error("Error en findByCredentials:", error);
  //     throw CustomError.internalServer();
  //   }
  // }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<UserEntity> {
    try {
      // 1. Buscar usuario
      const user = await UsuariosModel.findOne({ email });
      if (!user) throw CustomError.badRequest("Credenciales inválidas");

      // 2. Verificar contraseña
      if (!this.comparePassword(password, user.password)) {
        throw CustomError.badRequest("Credenciales inválidas");
      }

      // 3. Obtener datos adicionales
      const [role, centro, cuidadorData] = await Promise.all([
        RolesModel.findById(user.id_rol),
        user.id_centro_gerontologico
          ? CentroGerontologicoModel.findById(user.id_centro_gerontologico)
          : Promise.resolve(null),
        MedicosModel.findOne({ id_usuario: user._id }),
      ]);

      if (!role) throw CustomError.internalServer("Rol no encontrado");

      // 4. Validaciones SOLO para cuidadores CON centro asignado
      if (role.rolName === "Cuidador" && user.id_centro_gerontologico) {
        // 4.1 Verificar perfil médico
        if (!cuidadorData) {
          throw CustomError.badRequest("Perfil de cuidador incompleto");
        }

        // 4.2 Verificar aprobación
        if (cuidadorData.aprobado === false) {
          throw CustomError.badRequest(
            "Espere aprobación del administrador del centro"
          );
        }
      }

      // 5. Construir respuesta
      return UsuarioMapper.userAuthEntityFromObject({
        ...user.toObject(),
        rolName: role.rolName,
        tiene_centro_asignado: !!user.id_centro_gerontologico,
        centro_info: centro
          ? {
              id: centro._id,
              nombre: centro.nombre,
              direccion: centro.direccion,
              codigo_unico: centro.codigo_unico,
            }
          : null,
        aprobado:
          role.rolName === "Cuidador" ? cuidadorData?.aprobado : undefined,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error en findByCredentials:", error);
      throw CustomError.internalServer();
    }
  }

  async countAllHOME(centroId: string): Promise<any> {
    try {
      const fechaBusqueda = new Date();
      const fechaInicio = new Date(
        fechaBusqueda.getFullYear(),
        fechaBusqueda.getMonth(),
        fechaBusqueda.getDate()
      );
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(23, 59, 59, 999);

      // 1. Obtener los usuarios del centro
      const usuariosCentro = await UsuariosModel.find({
        id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
        deletedAt: null,
      }).distinct("_id");

      // 2. Obtener los pacientes del centro
      const pacientesDelCentro = await PacientesModel.find({
        id_usuario: { $in: usuariosCentro },
        deletedAt: null,
      }).distinct("_id");

      // 3. Contar pacientes del centro
      const totalPacientes = pacientesDelCentro.length;

      // 4. Filtros para conteos
      const filtroSignosVitalesHoy: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        id_paciente: { $in: pacientesDelCentro },
        deletedAt: null,
      };

      const filtroEjerciciosHoy: any = {
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        "paciente.id_paciente": {
          $in: pacientesDelCentro.map((id) => id.toString()),
        },
        deletedAt: null,
      };

      // 5. Ejecutar conteos en paralelo
      const [signosVitalesHoy, ejerciciosHoy] = await Promise.all([
        SignosVitalesModel.countDocuments(filtroSignosVitalesHoy),
        EjercicioResultadosModel.countDocuments(filtroEjerciciosHoy),
      ]);

      return {
        totalPacientes, // Total de pacientes en el centro
        signosVitalesHoy, // Signos vitales registrados hoy en el centro
        ejerciciosHoy, // Ejercicios generados hoy en el centro
        centroId, // Opcional: incluir el ID del centro en la respuesta
      };
    } catch (error) {
      console.error("Error al contar los registros:", error);
      throw CustomError.internalServer();
    }
  }
}
