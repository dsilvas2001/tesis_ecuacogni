import mongoose from "mongoose";
import {
  MedicosModel,
  RolesModel,
  UsuariosModel,
} from "../../data/mongodb/models";
import { CuidadorDatasource } from "../../domain";
import { CustomError } from "../errors/custom.error";

export class CuidadorDatasourceImpl implements CuidadorDatasource {
  async countCuidadoresPorEstado(centroId: string): Promise<{
    aprobados: number;
    noAprobados: number;
  }> {
    try {
      // 1. Buscar usuarios con rol Cuidador en el centro
      const usuariosCuidadores = await UsuariosModel.find({
        id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
        deletedAt: null,
      }).populate({
        path: "id_rol",
        model: "Roles", // Asegúrate que coincida con cómo lo registraste
        match: { rolName: "Cuidador", deletedAt: null },
        select: "_id",
      });

      // 2. Filtrar solo usuarios con rol poblado correctamente
      const cuidadoresIds = usuariosCuidadores
        .filter(
          (u) => u.id_rol && !(u.id_rol instanceof mongoose.Types.ObjectId)
        )
        .map((u) => u._id);

      // 3. Contar en paralelo
      const [aprobados, noAprobados] = await Promise.all([
        MedicosModel.countDocuments({
          id_usuario: { $in: cuidadoresIds },
          aprobado: true,
          deletedAt: null,
        }),
        MedicosModel.countDocuments({
          id_usuario: { $in: cuidadoresIds },
          aprobado: false,
          deletedAt: null,
        }),
      ]);

      return { aprobados, noAprobados };
    } catch (error) {
      console.error("Error al contar cuidadores:", error);
      throw CustomError.internalServer();
    }
  }

  async findAprobadosCuidadores(centroId: string): Promise<any[]> {
    try {
      // 1. Configurar opciones de populate para roles
      const rolPopulateOptions = {
        path: "id_rol",
        model: "Roles", // Nombre exacto del modelo registrado
        match: { rolName: "Cuidador", deletedAt: null },
      };

      // 2. Buscar usuarios cuidadores del centro
      const usuariosCuidadores = await UsuariosModel.find({
        id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
        deletedAt: null,
      })
        .populate(rolPopulateOptions)
        .lean();

      // 3. Filtrar solo usuarios con rol "Cuidador" válido
      const cuidadoresIds = usuariosCuidadores
        .filter(
          (u) => u.id_rol && !(u.id_rol instanceof mongoose.Types.ObjectId)
        )
        .map((u) => u._id);

      if (cuidadoresIds.length === 0) {
        return [];
      }

      // 4. Opciones de populate para usuarios en Médicos
      const usuarioPopulateOptions = {
        path: "id_usuario",
        model: "Usuarios", // Nombre exacto del modelo registrado
        select: "nombre apellido email",
        match: { deletedAt: null },
      };

      // 5. Buscar cuidadores aprobados
      const cuidadores = await MedicosModel.find({
        id_usuario: { $in: cuidadoresIds },
        aprobado: true,
        deletedAt: null,
      })
        .populate(usuarioPopulateOptions)
        .lean();

      // 6. Mapear resultados con validación
      return cuidadores
        .map((cuidador) => {
          const usuario = cuidador.id_usuario as
            | {
                nombre: string;
                apellido: string;
                email: string;
                _id: mongoose.Types.ObjectId;
              }
            | mongoose.Types.ObjectId;

          // Si no se pobló el usuario, omitir
          if (!usuario || usuario instanceof mongoose.Types.ObjectId) {
            return null;
          }

          return {
            id: cuidador._id.toString(),
            id_usuario: usuario._id.toString(),
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            experiencia_anios: cuidador.experiencia_anios,
            aprobado: cuidador.aprobado,
            fecha_registro: cuidador.createdAt,
          };
        })
        .filter(Boolean); // Filtrar posibles valores nulos
    } catch (error) {
      console.error("Error al buscar cuidadores aprobados:", error);
      throw CustomError.internalServer();
    }
  }

  async findNoAprobadosCuidadores(centroId: string): Promise<any[]> {
    try {
      // 1. Primero buscar directamente los médicos no aprobados del centro
      const cuidadoresNoAprobados = await MedicosModel.find({
        $or: [{ aprobado: false }, { aprobado: { $exists: false } }],
        deletedAt: null,
      })
        .populate({
          path: "id_usuario",
          model: UsuariosModel,
          match: {
            id_centro_gerontologico: new mongoose.Types.ObjectId(centroId),
            deletedAt: null,
            es_administrador: false,
          },
          select: "nombre apellido email id_rol",
          populate: {
            path: "id_rol",
            model: RolesModel,
            match: { rolName: "Cuidador", deletedAt: null },
            select: "rolName",
          },
        })
        .lean();

      console.log("Resultados brutos:", cuidadoresNoAprobados);

      // 2. Filtrar solo los que tienen usuario con rol Cuidador
      const resultadosFiltrados = cuidadoresNoAprobados
        .filter((cuidador) => {
          const usuario = cuidador.id_usuario as any;
          return (
            usuario &&
            !(usuario instanceof mongoose.Types.ObjectId) &&
            usuario.id_rol &&
            usuario.id_rol.rolName === "Cuidador"
          );
        })
        .map((cuidador) => {
          const usuario = cuidador.id_usuario as any;
          return {
            id: cuidador._id.toString(),
            id_usuario: usuario._id.toString(),
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            experiencia_anios: cuidador.experiencia_anios,
            aprobado: cuidador.aprobado,
            fecha_registro: cuidador.createdAt,
          };
        });

      return resultadosFiltrados;
    } catch (error) {
      console.error("Error al buscar cuidadores no aprobados:", error);
      throw CustomError.internalServer();
    }
  }

  async aprobarCuidador(cuidadorId: string): Promise<boolean> {
    try {
      const result = await MedicosModel.findByIdAndUpdate(
        cuidadorId,
        { aprobado: true },
        { new: true }
      );

      if (!result) {
        throw CustomError.badRequest("Cuidador no encontrado");
      }

      return true;
    } catch (error) {
      console.error("Error al aprobar cuidador:", error);
      throw CustomError.internalServer();
    }
  }
}
