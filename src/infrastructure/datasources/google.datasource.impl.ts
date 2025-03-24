import axios from "axios";
import { envs } from "../../config";

export class GoogleSearchDatasourceImpl {
  private readonly searchId: string;
  private readonly apiKey: string;
  private readonly unsplashKey: string = envs.UNSPLASH_KEY;

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

  // async getFirstImageUrl(query: string): Promise<string | null> {
  //   try {
  //     const adjustedQuery = `foto real de "${query}" -vector -icon -ilustración site:freepik.com`;
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

  //     console.log(
  //       "Datos completos de la API:",
  //       JSON.stringify(response.data, null, 2)
  //     );

  //     if (!response.data.items || response.data.items.length === 0) {
  //       console.warn("No se encontraron imágenes para:", query);
  //       return "URL_DE_IMAGEN_POR_DEFECTO";
  //     }

  //     // Priorizar imágenes de Freepik
  //     const freepikImage = response.data.items.find((item: any) =>
  //       item.displayLink.includes("freepik.com")
  //     );

  //     if (freepikImage) {
  //       return freepikImage.link;
  //     }

  //     // Si no hay de Freepik, buscar la más relevante con la palabra clave en el título
  //     const relevantImage = response.data.items.find((item: any) =>
  //       item.title.toLowerCase().includes(query.toLowerCase())
  //     );

  //     return relevantImage ? relevantImage.link : "URL_DE_IMAGEN_POR_DEFECTO";
  //   } catch (error) {
  //     console.error("Error al buscar la imagen:", error);
  //     return "URL_DE_IMAGEN_POR_DEFECTO";
  //   }
  // }

  // Método para realizar una búsqueda predeterminada

  // async getFirstImageUrl(query: string): Promise<string> {
  //   try {
  //     // 1. Detección dinámica del tipo de búsqueda
  //     const searchContext = this.detectSearchContext(query);

  //     // 2. Construcción de query adaptativa
  //     const { searchQuery, priorityDomains } = this.buildAdaptiveQuery(
  //       query,
  //       searchContext
  //     );

  //     // 3. Búsqueda con parámetros optimizados
  //     const response = await axios.get(
  //       "https://www.googleapis.com/customsearch/v1",
  //       {
  //         params: {
  //           q: searchQuery,
  //           cx: this.searchId,
  //           key: this.apiKey,
  //           searchType: "image",
  //           safe: "active",
  //           num: 10,
  //           rights: "cc_publicdomain",
  //         },
  //       }
  //     );

  //     // 4. Selección inteligente de resultados
  //     const bestMatch = this.selectBestImageResult(
  //       response.data?.items,
  //       query,
  //       priorityDomains
  //     );

  //     return bestMatch || this.generateContextualFallback(query, searchContext);
  //   } catch (error) {
  //     console.error(`Error en búsqueda de "${query}":`, error);
  //     return this.generateContextualFallback(query, "general");
  //   }
  // }

  // // Métodos de apoyo
  // private detectSearchContext(query: string): string {
  //   const cleanQuery = query.toLowerCase().trim();

  //   // Detección de colores por nombre básico
  //   const colorRegex =
  //     /^(azul|rojo|verde|amarillo|negro|blanco|rosado|morado|gris|naranja)$/;
  //   if (colorRegex.test(cleanQuery)) return "color";

  //   // Detección de animales por sufijos comunes
  //   if (/(pájaro|pez|gato|perro|ave|animal)(s|es)?$/i.test(cleanQuery))
  //     return "animal";

  //   return "general";
  // }

  // private buildAdaptiveQuery(
  //   query: string,
  //   context: string
  // ): { searchQuery: string; priorityDomains: string[] } {
  //   const baseExclusions =
  //     "-vector -icono -ilustración -dibujo -arte -texto -logo";
  //   let contextTerms = "";
  //   let domains = ["unsplash.com", "pexels.com", "freepik.com"];

  //   switch (context) {
  //     case "color":
  //       contextTerms = `"muestra de color" "color sólido" pantone`;
  //       domains = ["coolors.co", "colorhexa.com", "paletton.com"];
  //       break;
  //     case "animal":
  //       contextTerms = `"foto real" "en su hábitat natural"`;
  //       domains = ["nationalgeographic.com", "arkive.org", "flickr.com"];
  //       break;
  //     default:
  //       contextTerms = `"foto realista" "alta calidad"`;
  //   }

  //   return {
  //     searchQuery: `"${query}" ${contextTerms} ${baseExclusions} ${domains
  //       .map((d) => `site:${d}`)
  //       .join(" OR ")}`,
  //     priorityDomains: domains,
  //   };
  // }

  // private selectBestImageResult(
  //   items: any[],
  //   query: string,
  //   priorityDomains: string[]
  // ): string | null {
  //   if (!items?.length) return null;

  //   // Priorizar por dominio y relevancia
  //   const prioritizedResults = items.sort((a, b) => {
  //     const aDomainScore = priorityDomains.findIndex((d) =>
  //       a.displayLink.includes(d)
  //     );
  //     const bDomainScore = priorityDomains.findIndex((d) =>
  //       b.displayLink.includes(d)
  //     );

  //     const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase())
  //       ? 2
  //       : 0;
  //     const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase())
  //       ? 2
  //       : 0;

  //     return bDomainScore + bTitleMatch - (aDomainScore + aTitleMatch);
  //   });

  //   return prioritizedResults[0]?.link;
  // }

  // private async generateContextualFallback(
  //   query: string,
  //   context: string
  // ): Promise<string> {
  //   // 1. Búsqueda de emergencia en Freepik como último intento
  //   try {
  //     const freepikResponse = await axios.get(
  //       "https://www.googleapis.com/customsearch/v1",
  //       {
  //         params: {
  //           q: `${query} site:freepik.com`,
  //           cx: this.searchId,
  //           key: this.apiKey,
  //           searchType: "image",
  //           imgSize: "medium",
  //           safe: "active",
  //         },
  //       }
  //     );

  //     if (freepikResponse.data.items?.length) {
  //       return freepikResponse.data.items[0].link;
  //     }
  //   } catch (error) {
  //     console.log("Fallo en búsqueda Freepik de emergencia");
  //   }

  //   // 2. Usar APIs de imágenes gratuitas
  //   const apiServices = [
  //     `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`,
  //     `https://loremflickr.com/600/400/${encodeURIComponent(query)}`,
  //   ];

  //   for (const service of apiServices) {
  //     try {
  //       const test = await axios.head(service);
  //       if (test.status === 200) return service;
  //     } catch (error) {
  //       continue;
  //     }
  //   }

  //   // 3. Si todo falla, buscar en Google sin restricciones
  //   try {
  //     const emergencySearch = await axios.get(
  //       "https://www.googleapis.com/customsearch/v1",
  //       {
  //         params: {
  //           q: query,
  //           cx: this.searchId,
  //           key: this.apiKey,
  //           searchType: "image",
  //           imgSize: "medium",
  //           safe: "active",
  //         },
  //       }
  //     );

  //     if (emergencySearch.data.items?.length) {
  //       return emergencySearch.data.items[0].link;
  //     }
  //   } catch (error) {
  //     console.log("Fallo en búsqueda de emergencia general");
  //   }

  //   // 4. Último recurso: Placeholder mejorado
  //   return `https://dummyimage.com/600x400/cccccc/ffffff&text=${encodeURIComponent(
  //     query
  //   )}`;
  // }

  async getFirstImageUrl(query: string): Promise<string> {
    // Validar query vacío
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      console.warn("Query vacío, usando fallback.");
      return this.getFallbackImage(query, false);
    }

    const isColor = this.isColorQuery(trimmedQuery);
    console.log(`Buscando imagen para: ${trimmedQuery}`);

    // 1. Intentar con Unsplash
    console.log("Intentando con Unsplash...");
    const unsplashUrl = await this.getUnsplashImageUrl(trimmedQuery);
    if (unsplashUrl) {
      console.log(`Imagen encontrada en Unsplash: ${unsplashUrl}`);
      return unsplashUrl;
    }

    console.log(
      "No se encontró imagen en Unsplash. Recurriendo a Google Custom Search..."
    );

    // 2. Buscar en Google Custom Search
    try {
      const searchQuery = this.buildQuery(trimmedQuery, isColor);
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            q: searchQuery,
            cx: this.searchId,
            key: this.apiKey,
            searchType: "image",
            safe: "active",
            num: 5,
            imgSize: "large",
          },
        }
      );

      const items: any[] = response.data?.items || [];
      // Filtrar para excluir URLs no deseadas
      const validItems = items.filter(
        (item) => !/loremflickr|placeholder|dummyimage/i.test(item.link)
      );

      if (validItems.length > 0) {
        console.log(
          `Imagen encontrada en Google Custom Search: ${validItems[0].link}`
        );
        return validItems[0].link;
      }

      console.log(
        "No se encontró imagen en Google Custom Search. Recurriendo a fallback..."
      );
    } catch (error) {
      console.error("Error en Google Custom Search:", error);
    }

    // 3. Fallback
    return this.getFallbackImage(trimmedQuery, isColor);
  }

  private async getUnsplashImageUrl(query: string): Promise<string | null> {
    try {
      console.log(`Buscando en Unsplash: ${query}`);
      const response = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          params: {
            query: query,
            client_id: envs.UNSPLASH_KEY,
          },
        }
      );
      console.log("Respuesta de Unsplash:", response.data);
      return response.data?.urls?.full || null;
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
      return null;
    }
  }

  private isColorQuery(query: string): boolean {
    const colors = ["rojo", "azul", "verde", "amarillo", "negro", "blanco"];
    return colors.some((color) => query.toLowerCase().includes(color));
  }

  private buildQuery(query: string, isColor: boolean): string {
    const baseExclusions = "-vector -icono -dibujo -arte";

    return isColor
      ? `"${query}" "muestra de color" ${baseExclusions} site:freepik.com OR site:coolors.co`
      : `"${query}" "foto realista" ${baseExclusions} site:freepik.com OR site:unsplash.com`;
  }

  private async getFallbackImage(
    query: string,
    isColor: boolean
  ): Promise<string> {
    // Para colores: Solo Freepik
    if (isColor) {
      const fallbackUrl = `https://img.freepik.com/free-photo/${encodeURIComponent(
        query
      )}-background`;
      console.log(`Usando fallback para colores: ${fallbackUrl}`);
      return fallbackUrl;
    }

    // Para NO colores: Usar Unsplash como último recurso
    const fallbackUrl = `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(
      query
    )}`;
    console.log(`Usando fallback genérico: ${fallbackUrl}`);
    return fallbackUrl;
  }
}
