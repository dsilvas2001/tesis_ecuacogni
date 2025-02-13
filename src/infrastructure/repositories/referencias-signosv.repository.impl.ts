import {
  CountResultReferenciaSignosV,
  NotReferenciaSignoVEntity,
  ReferenciaSignosVDataSource,
  ReferenciaSignosVDto,
  ReferenciaSignosVEntity,
  ReferenciaSignosVRepository,
} from "../../domain";

export class ReferenciaSignosVRepositoryImpl
  implements ReferenciaSignosVRepository
{
  constructor(
    private readonly referenciaSignosVDatasource: ReferenciaSignosVDataSource
  ) {}

  async register(
    referenciaSignosVDatasourceDto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity> {
    return this.referenciaSignosVDatasource.register(
      referenciaSignosVDatasourceDto
    );
  }

  async update(
    id_paciente: string,
    referenciaSignosVDto: ReferenciaSignosVDto
  ): Promise<ReferenciaSignosVEntity> {
    return this.referenciaSignosVDatasource.update(
      id_paciente,
      referenciaSignosVDto
    );
  }

  async findAll(): Promise<ReferenciaSignosVEntity[]> {
    return this.referenciaSignosVDatasource.findAll();
  }

  async findNotReferenciaSignosV(): Promise<NotReferenciaSignoVEntity[]> {
    return this.referenciaSignosVDatasource.findNotReferenciaSignosV();
  }

  async delete(id: string): Promise<string> {
    return this.referenciaSignosVDatasource.delete(id);
  }

  async countAll(): Promise<CountResultReferenciaSignosV> {
    return this.referenciaSignosVDatasource.countAll();
  }
}
