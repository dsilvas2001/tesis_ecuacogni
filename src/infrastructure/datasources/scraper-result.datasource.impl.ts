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
      timeout: 30000,
      puppeteerOptions: { args: ["--no-sandbox"] },
    });
  }

  async getScraperGeneral(categoria: string): Promise<any[]> {
    const results: any[] = [];

    try {
      // Obtener URLs de búsqueda
      const urls = await this.googleSearch.performSearch(categoria);
      console.log("URLs obtenidas:", urls);
      this.searchCustom = categoria;

      // Selecciona aleatoriamente 5 URLs para procesar
      const getRandomUrls = (array: string[], count: number): string[] => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      const randomUrls = getRandomUrls(urls, 5);
      console.log("URLs aleatorias seleccionadas:", randomUrls);

      // Agregar las URLs seleccionadas a la cola con manejo de errores
      for (const url of randomUrls) {
        try {
          await this.cluster.queue(url);
        } catch (error) {
          console.error(`Error al agregar URL a la cola: ${url}`, error);
        }
      }

      // Definir la tarea del cluster
      await this.cluster.task(async ({ page, data: url }) => {
        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          console.log(`Procesando URL: ${url}`);

          const data = await page.evaluate(() => {
            const titulo =
              document.querySelector("h1")?.textContent?.trim() || null;
            const descripcion =
              Array.from(document.querySelectorAll("p"))
                .slice(0, 3)
                .map((p) => p.textContent?.trim())
                .filter((text) => text && text.length > 20)
                .join(" ") || null;

            // const nombre_categoria = titulo || null;
            // const descripcion_categoria =
            //   Array.from(document.querySelectorAll("p"))
            //     .slice(0, 2)
            //     .map((p) => p.textContent?.trim())
            //     .filter((text) => text && text.length > 20)
            //     .join(" ") || null;

            const nombre_fuentes = titulo || null;
            const autor =
              document
                .querySelector('meta[name="author"]')
                ?.getAttribute("content") ||
              document
                .querySelector('meta[property="og:site_name"]')
                ?.getAttribute("content") ||
              new URL(window.location.href).hostname
                .replace("www.", "")
                .split(".")[0] ||
              null;

            return {
              titulo,
              descripcion,
              // categoria: {
              //   nombre: nombre_categoria,
              //   descripcion: descripcion_categoria?.substring(0, 200) || null,
              // },
              fuente: {
                nombre: nombre_fuentes,
                url: window.location.href,
                autor,
              },
            };
          });

          if (
            data.titulo &&
            data.descripcion &&
            // data.categoria?.descripcion &&
            data.fuente?.url
          ) {
            results.push({
              titulo: data.titulo.toString(),
              descripcion: data.descripcion,
              // categoria: [
              //   {
              //     nombre: data.categoria.nombre!.toString(),
              //     descripcion: data.categoria.descripcion,
              //   },
              // ],
              fuente: [
                {
                  nombre: data.fuente.nombre?.toString(),
                  url: data.fuente.url,
                  autor: data.fuente.autor!,
                },
              ],
            });
          } else {
            console.warn(`Datos incompletos extraídos de: ${url}`);
          }
        } catch (error) {
          console.error(`Error procesando la URL: ${url}`, error);
        }
      });

      await this.cluster.idle();
      await this.cluster.close();
    } catch (error) {
      console.error("Error general en el scraper:", error);
    }

    // Filtrar resultados válidos
    // const filteredResults = results.filter(
    //   (item) => item.titulo && item.descripcion && item.fuente?.url
    // );
    const filteredResults = results.filter(
      (item) => item.titulo && item.descripcion && item.fuente![0].url
    );
    console.log("Resultados filtrados:", filteredResults);

    // Guardar los resultados en la base de datos
    try {
      const savedEjercicios = await this.guardarEjercicios(filteredResults);
      // console.log("Resultados guardados:", savedEjercicios);
      return savedEjercicios;
    } catch (error) {
      console.error(
        "Error al guardar los resultados en la base de datos:",
        error
      );
      return []; // Retorna un array vacío en caso de error
    }
  }

  private async guardarEjercicios(ejercicios: any[]): Promise<any[]> {
    // Crear un grupo de scraping
    const scrapingGroup = await ScrapingGroupModel.create({
      nombre: "Grupo de ejercicios generados",
      descripcion: this.searchCustom,
    });

    const savedEjercicios = [];

    for (const ejercicio of ejercicios) {
      // Guardar el resultado del scraping
      const scrapingResult = await ScrapingResultModel.create({
        url: ejercicio.fuente[0].url,
        contenido: ejercicio,
        estado: "exitoso", // Puedes cambiar esto según el resultado
      });

      // Asociar el resultado al grupo de scraping
      await ScrapingGroupItemModel.create({
        id_grupo: scrapingGroup._id,
        id_scraping: scrapingResult._id,
      });

      savedEjercicios.push(scrapingResult);
    }

    return savedEjercicios;
  }
}
