import { ReferenciaSignosVDto } from "../dtos/referencias-signosv.dto";
import {
  CountResultReferenciaSignosV,
  NotReferenciaSignoVEntity,
  ReferenciaSignosVEntity,
} from "../entities/referencias-signosv.entity";

export abstract class ReferenciaSignosVRepository {
  abstract register(
    referenciaSignosVDto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity>;

  abstract update(
    id_paciente: string,
    referenciaSignosVdto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity>;

  abstract findAll(centroId: string): Promise<ReferenciaSignosVEntity[]>;

  abstract findNotReferenciaSignosV(
    centroId: string
  ): Promise<NotReferenciaSignoVEntity[]>;

  abstract countAll(centroId: string): Promise<CountResultReferenciaSignosV>;

  abstract delete(id_paciente: string): Promise<string>;
}
