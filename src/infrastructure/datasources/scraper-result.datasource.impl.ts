import { Cluster } from "puppeteer-cluster";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";
import { GoogleSearchDatasourceImpl } from "./google.datasource.impl";
import { ScrapingGroupModel } from "../../data/mongodb/models/scraping-group.model";
import { ScrapingResultModel } from "../../data/mongodb/models/scraping-result.model";
import { ScrapingGroupItemModel } from "../../data/mongodb/models/scraping-item.model";

export class ScraperResultDatasourceImpl {
  private googleSearch: GoogleSearchDatasourceImpl =
    new GoogleSearchDatasourceImpl();
  private cluster!: Cluster;
  private searchCustom: string = "ejercicios de estimulación cognitiva";

  constructor() {
    this.initCluster();
  }

  private async initCluster() {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 3,
      retryLimit: 5,
      timeout: 10000,
      puppeteerOptions: { args: ["--no-sandbox"] },
    });
  }

  async getScraperGeneral(categoria: string): Promise<any[]> {
    console.log("INGRESANDO A SCRAPER GENERAL");

    const results: any[] = [];

    try {
      // Paso 1: Obtener URLs de búsqueda
      const urls = await this.googleSearch.performSearch(categoria);
      console.log("URLs obtenidas:", urls);
      if (urls.length === 0) {
        console.warn("No se encontraron URLs para la categoría:", categoria);
        return [];
      }
      this.searchCustom = categoria;

      // Paso 2: Definir la tarea del cluster (con timeout reducido a 4 segundos)
      await this.cluster.task(async ({ page, data: url }) => {
        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 4000, // Ajustado a 4 segundos
          });
          console.log(`Procesando URL: ${url}`);
          const data = await page.evaluate(() => {
            const titulo = document.querySelector("h1")?.textContent;
            const descripcion = document
              .querySelector('meta[name="description"]')
              ?.getAttribute("content");
            const fuente = {
              nombre: document
                .querySelector('meta[name="author"]')
                ?.getAttribute("content"),
              url: window.location.href,
              autor: document
                .querySelector('meta[name="author"]')
                ?.getAttribute("content"),
            };
            return { titulo, descripcion, fuente };
          });

          if (data.titulo && data.descripcion && data.fuente?.url) {
            results.push({
              titulo: data.titulo.toString(),
              descripcion: data.descripcion,
              fuente: [
                {
                  nombre: data.fuente.nombre?.toString(),
                  url: data.fuente.url,
                  autor: data.fuente.autor!,
                },
              ],
            });
          }
        } catch (error) {
          console.error(`Error procesando ${url}:`, error);
        }
      });

      // Paso 3: Seleccionar y encolar URLs de forma concurrente
      const randomUrls = this.getRandomUrls(urls, 2);
      console.log("URLs aleatorias:", randomUrls);
      await Promise.all(randomUrls.map((url) => this.cluster.queue(url)));

      // Paso 4: Esperar a que finalice el procesamiento y cerrar el cluster
      await this.cluster.idle();
      await this.cluster.close();
    } catch (error) {
      console.error("Error general:", error);
      return [];
    }

    // Filtrado de resultados y guardado en BD
    const filteredResults = results.filter(
      (item) => item.titulo && item.descripcion && item.fuente[0].url
    );
    console.log("Resultados filtrados:", filteredResults);
    return this.guardarEjercicios(filteredResults);
  }

  // Método de clase para selección aleatoria
  private getRandomUrls(array: string[], count: number): string[] {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private async guardarEjercicios(ejercicios: any[]): Promise<any[]> {
    console.log("esta ingresando ejercicios:");
    console.log("esta ingresando ejercicios:");
    console.log("esta ingresando ejercicios:");
    console.log("esta ingresando ejercicios:");
    console.log("esta ingresando ejercicios:");
    console.log("esta ingresando ejercicios:", ejercicios);

    const scrapingGroup = await ScrapingGroupModel.create({
      nombre: "Grupo de ejercicios generados",
      descripcion: this.searchCustom,
    });

    const savedEjercicios = [];

    for (const ejercicio of ejercicios) {
      const scrapingResult = await ScrapingResultModel.create({
        url: ejercicio.fuente[0].url,
        contenido: ejercicio,
        estado: "exitoso",
      });

      await ScrapingGroupItemModel.create({
        id_grupo: scrapingGroup._id,
        id_scraping: scrapingResult._id,
      });

      savedEjercicios.push(scrapingResult);
    }
    return savedEjercicios;
  }
}
