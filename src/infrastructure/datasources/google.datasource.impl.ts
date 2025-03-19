import axios from "axios";
import { envs } from "../../config";

export class GoogleSearchDatasourceImpl {
  private readonly searchId: string;
  private readonly apiKey: string;
  private delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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
  // async getFirstImageUrl(query: string): Promise<string | null> {
  //   try {
  //     // Intenta diferentes formas de consulta aquí
  //     const adjustedQuery = `${query} imagen fotografía -dibujo -vector`;

  //     const response = await axios.get(
  //       "https://www.googleapis.com/customsearch/v1",
  //       {
  //         params: {
  //           q: adjustedQuery,
  //           cx: this.searchId,
  //           key: this.apiKey,
  //           searchType: "image",
  //           imgSize: "medium",
  //           imgType: "photo",
  //           safe: "active",
  //         },
  //       }
  //     );

  //     // Imprimir toda la respuesta para depurar
  //     console.log(
  //       "Datos completos de la API:",
  //       JSON.stringify(response.data, null, 2)
  //     );

  //     if (!response.data.items || response.data.items.length === 0) {
  //       console.warn("No se encontraron imágenes para:", query);
  //       return null;
  //     }

  //     return response.data.items[0].link || null;
  //   } catch (error) {
  //     console.error("Error al buscar la imagen:", error);
  //     return null;
  //   }
  // }

  async getFirstImageUrl(query: string): Promise<string | null> {
    try {
      const adjustedQuery = `foto real de "${query}" -vector -icon -ilustración site:freepik.com`;
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            q: adjustedQuery,
            cx: this.searchId,
            key: this.apiKey,
            searchType: "image",
            imgSize: "medium",
            imgType: "photo",
            safe: "active",
          },
        }
      );

      console.log(
        "Datos completos de la API:",
        JSON.stringify(response.data, null, 2)
      );

      if (!response.data.items || response.data.items.length === 0) {
        console.warn("No se encontraron imágenes para:", query);
        return "URL_DE_IMAGEN_POR_DEFECTO";
      }

      // Priorizar imágenes de Freepik
      const freepikImage = response.data.items.find((item: any) =>
        item.displayLink.includes("freepik.com")
      );

      if (freepikImage) {
        return freepikImage.link;
      }

      // Si no hay de Freepik, buscar la más relevante con la palabra clave en el título
      const relevantImage = response.data.items.find((item: any) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

      return relevantImage ? relevantImage.link : "URL_DE_IMAGEN_POR_DEFECTO";
    } catch (error) {
      console.error("Error al buscar la imagen:", error);
      return "URL_DE_IMAGEN_POR_DEFECTO";
    }
  }

  // Método para realizar una búsqueda predeterminada
  async getDefaultSearchResults(): Promise<string[]> {
    const defaultQuery = "Ejercicios de estimulación cognitiva";
    return await this.performSearch(defaultQuery);
  }
}
