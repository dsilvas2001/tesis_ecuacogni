export class CuidadorUseCase {
  constructor(private readonly cuidadorRepository: any) {}

  async execute() {
    return await this.cuidadorRepository.getCuidadorJson();
  }
  async getCuidadorById(id: string) {
    return await this.cuidadorRepository.getCuidadorById(id);
  }
  async getCuidadorByEmail(email: string) {
    return await this.cuidadorRepository.getCuidadorByEmail(email);
  }
  async getCuidadorByCpf(cpf: string) {
    return await this.cuidadorRepository.getCuidadorByCpf(cpf);
  }
}
