import { ReferenciaSignosVDto } from "../dtos/referencias-signosv.dto";
import {
  CountResultReferenciaSignosV,
  NotReferenciaSignoVEntity,
  ReferenciaSignosVEntity,
} from "../entities/referencias-signosv.entity";

export abstract class ReferenciaSignosVDataSource {
  abstract register(
    referenciaSignosVDto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity>;

  abstract update(
    id_paciente: string,
    referenciaSignosVdto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity>;

  abstract findAll(): Promise<ReferenciaSignosVEntity[]>;

  abstract countAll(): Promise<CountResultReferenciaSignosV>;

  abstract findNotReferenciaSignosV(): Promise<NotReferenciaSignoVEntity[]>;

  abstract delete(id_paciente: string): Promise<string>;
}
