import { ScraperGeneralRepository } from "../repositories/scraper-general.repository";

export class ScraperGeneralUseCase {
  constructor(
    private readonly scraperGeneralRepository: ScraperGeneralRepository
  ) {}

  async execute() {
    return await this.scraperGeneralRepository.getScraperGeneralJson();
  }
}
