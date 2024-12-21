import axios from "axios";
import { envs } from "../../config";

export class GoogleSearchDatasourceImpl {
  private readonly searchId: string;
  private readonly apiKey: string;

  constructor() {
    this.searchId = envs.GOOGLE_SEARCH_ID;
    this.apiKey = envs.GOOGLE_SEARCH_KEY;
  }

  // Método para realizar una búsqueda personalizada
  async performSearch(query: string): Promise<string[]> {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            q: query,
            cx: this.searchId,
            key: this.apiKey,
          },
        }
      );

      const links: string[] =
        response.data.items?.map((item: any) => item.link) || [];
      return links;
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
      throw new Error("Error al realizar la búsqueda en Google Search.");
    }
  }

  // Método para realizar una búsqueda predeterminada
  async getDefaultSearchResults(): Promise<string[]> {
    const defaultQuery = "Ejercicios de estimulación cognitiva";
    return await this.performSearch(defaultQuery);
  }
}
