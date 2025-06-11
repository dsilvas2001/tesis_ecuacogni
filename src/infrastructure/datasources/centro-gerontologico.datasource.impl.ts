import { UsuariosModel } from "../../data/mongodb/models";
import { CentroGerontologicoModel } from "../../data/mongodb/models/centro-gerontologico.model";
import {
  CentroDatasource,
  CrearCentroDto,
  UnirseCentroDto,
} from "../../domain";
import { CustomError } from "../errors/custom.error";

export class CentroDatasourceImpl implements CentroDatasource {
  async crearCentro(crearCentroDto: CrearCentroDto): Promise<any> {
    try {
      const centroExistente = await CentroGerontologicoModel.findOne({
        id_administrador: crearCentroDto.id_administrador,
      });

      if (centroExistente) {
        throw CustomError.badRequest(
          "El administrador ya tiene un centro asignado."
        );
      }
      // Generar código único (puedes personalizar esta lógica)
      const codigo_unico =
        "CG-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const centro = await CentroGerontologicoModel.create({
        ...crearCentroDto,
        codigo_unico,
      });

      // Asignar el centro al administrador
      await UsuariosModel.findByIdAndUpdate(crearCentroDto.id_administrador, {
        id_centro_gerontologico: centro._id,
        es_administrador: true,
      });

      return {
        id: centro.id,
        nombre: centro.nombre,
        codigo_unico: centro.codigo_unico,
      };
    } catch (error) {
      if (error instanceof CustomError) throw error; // ← permite que el mensaje de badRequest llegue al cliente
      console.error("Error inesperado en crearCentro:", error);
      throw CustomError.internalServer();
    }
  }

  async unirseCentro(unirseCentroDto: UnirseCentroDto): Promise<any> {
    try {
      const centro = await CentroGerontologicoModel.findOne({
        codigo_unico: unirseCentroDto.codigo_centro,
      });

      if (!centro) {
        throw CustomError.badRequest("Centro no encontrado");
      }

      const usuario = await UsuariosModel.findById(unirseCentroDto.id_usuario);

      if (!usuario) {
        throw CustomError.badRequest("Usuario no encontrado");
      }

      if (usuario.es_administrador) {
        throw CustomError.badRequest(
          "El usuario ya es administrador de un centro."
        );
      }

      if (usuario.id_centro_gerontologico) {
        throw CustomError.badRequest("El usuario ya está unido a otro centro.");
      }

      // Ahora sí actualiza el usuario
      const usuarioActualizado = await UsuariosModel.findByIdAndUpdate(
        unirseCentroDto.id_usuario,
        { id_centro_gerontologico: centro._id },
        { new: true }
      );

      if (!usuarioActualizado) {
        throw CustomError.internalServer("No se pudo actualizar el usuario.");
      }

      return {
        centro: {
          id: centro.id,
          nombre: centro.nombre,
        },
        usuario: {
          id: usuarioActualizado.id,
          nombre: usuarioActualizado.nombre,
        },
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error en unirseCentro:", error);
      throw CustomError.internalServer();
    }
  }
}
