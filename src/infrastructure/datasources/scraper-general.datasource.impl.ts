import { Cluster } from "puppeteer-cluster";
import {
  CategoriasDto,
  EjercicioDto,
  EjercicioZod,
  FuentesDto,
  OpenAIDto,
  ScraperGeneralDatasource,
} from "../../domain";
import { FuentesDatasourceImpl } from "./fuentes.datasource.impl";
import { CategoriasDatasourceImpl } from "./categorias.datasource.impl";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";
import { EjercicioModel } from "../../data/mongodb/models";
import { ScraperGeneralMapper } from "../mappers/scraper-general.mapper";
import mongoose from "mongoose";
import { Page } from "puppeteer";
import { CustomError } from "../errors/custom.error";
import { GoogleSearchDatasourceImpl } from "./google.datasource.impl";

export class ScraperGeneralDatasourceImpl implements ScraperGeneralDatasource {
  private categoriasDatasource: CategoriasDatasourceImpl =
    new CategoriasDatasourceImpl();
  private fuentesDatasource: FuentesDatasourceImpl =
    new FuentesDatasourceImpl();
  private openaiDatasource: OpenAIDatasourceImpl = new OpenAIDatasourceImpl();

  private googleSearch: GoogleSearchDatasourceImpl =
    new GoogleSearchDatasourceImpl();
  private cluster!: Cluster;

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

  async getScraperGeneralJson(): Promise<any[]> {
    const results: EjercicioDto[] = [];

    const urls = await this.googleSearch.performSearch(
      "ejercicios de estimulación cognitiva"
    );

    // const urls = [
    //   "https://www.bitbrain.com/es/blog/ejercicios-estimulacion-cognitiva",
    //   "https://www.neuropsicologiagdb.com/cuadernos",
    //   "https://cerebroagil.com/actividades-de-estimulacion-cognitiva/",
    //   "https://neuronup.com/estimulacion-y-rehabilitacion-cognitiva/10-ejercicios-de-estimulacion-cognitiva/",
    // ];

    // Selecciona aleatoriamente 5 URLs para procesar
    const getRandomUrls = (array: string[], count: number): string[] => {
      const shuffled = [...array].sort(() => 0.5 - Math.random()); // Baraja las URLs aleatoriamente
      return shuffled.slice(0, count); // Selecciona las primeras 'count' URLs
    };

    const randomUrls = getRandomUrls(urls, 5); // Obtén 5 URLs aleatorias

    // Agregar las URLs seleccionadas a la cola
    for (const url of randomUrls) {
      await this.cluster.queue(url);
    }

    // Procesar cada URL de la cola
    await this.cluster.task(async ({ page, data: url }) => {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
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

          const nombre_categoria = titulo || null;
          const descripcion_categoria =
            Array.from(document.querySelectorAll("p"))
              .slice(0, 2)
              .map((p) => p.textContent?.trim())
              .filter((text) => text && text.length > 20)
              .join(" ") || null;

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
            categoria: {
              nombre: nombre_categoria,
              descripcion: descripcion_categoria?.substring(0, 200) || null,
            },
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
          data.categoria?.descripcion &&
          data.fuente?.url
        ) {
          results.push({
            titulo: data.titulo.toString(),
            descripcion: data.descripcion,
            categoria: [
              {
                nombre: data.categoria.nombre!.toString(),
                descripcion: data.categoria.descripcion,
              },
            ],
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

    const filteredResults = results.filter(
      (item) =>
        item.titulo &&
        item.descripcion &&
        item.categoria![0].descripcion &&
        item.fuente![0].url
    );

    console.log("filteredResults");
    console.log("filteredResults");
    console.log(filteredResults);

    const savedEjercicios = await this.alljson(filteredResults);

    return savedEjercicios.filter(
      (item) => item.titulo && item.descripcion && item.categoria && item.fuente
    );
  }

  private async alljson(ejercicios: any[]): Promise<any[]> {
    const categoriasTemp = ejercicios.flatMap((e) => e.categoria);
    const fuentesTemp = ejercicios.flatMap((e) => e.fuente);

    // Guardar las categorías en la base de datos
    const savedCategorias: any[] =
      await this.categoriasDatasource.saveCategorias(
        categoriasTemp.map((categoria) => {
          return categoria!;
        })
      );

    // Guardar las fuentes en la base de datos
    const savedFuentes: any[] = await this.fuentesDatasource.saveFuentes(
      fuentesTemp.map((fuente) => {
        return fuente!;
      })
    );

    // Crear mapas para acceso rápido a categorías y fuentes guardadas
    const categoriasMap = new Map(
      categoriasTemp.map((cat, index) => [cat, savedCategorias[index]])
    );
    const fuentesMap = new Map(
      fuentesTemp.map((fuente, index) => [fuente, savedFuentes[index]])
    );

    // Procesar ejercicios y guardarlos en la base de datos
    const processedEjercicios = await Promise.all(
      ejercicios.map(async (ejercicio) => {
        // Actualizar categorías
        const categoriasActualizadas = ejercicio.categoria.map((cat: any) => {
          const categoriaGuardada = categoriasMap.get(cat);
          if (!categoriaGuardada) {
            throw CustomError.badRequest(
              `No se encontró una categoría correspondiente para: ${JSON.stringify(
                cat
              )}`
            );
          }

          return {
            id: categoriaGuardada.id!.toString(),
            nombre: categoriaGuardada.nombre,
            descripcion: categoriaGuardada.descripcion,
          };
        });

        // Actualizar fuentes
        const fuentesActualizadas = ejercicio.fuente.map((fuente: any) => {
          const fuenteGuardada = fuentesMap.get(fuente);
          if (!fuenteGuardada) {
            throw CustomError.badRequest(
              `No se encontró una fuente correspondiente para: ${JSON.stringify(
                fuente
              )}`
            );
          }
          return {
            id: fuenteGuardada._id!.toString(),
            nombre: fuenteGuardada.nombre,
            url: fuenteGuardada.url,
            autor: fuenteGuardada.autor,
          };
        });

        // Generar título y descripción con IA
        const { titulo, descripcion, duracion, dificultad } =
          await this.generateAIContent(ejercicio);

        const showEjercicio = {
          titulo,
          descripcion,
          duracion,
          dificultad,
          categoria: categoriasActualizadas,
          fuente: fuentesActualizadas,
        };
        const newEjercicio = {
          titulo,
          descripcion,
          duracion,
          dificultad,
          id_categoria: categoriasActualizadas[0].id,
          id_fuente: fuentesActualizadas[0].id,
        };

        console.log("newEjercicio");
        console.log("newEjercicio");
        console.log("newEjercicio");
        console.log("newEjercicio");
        console.log("newEjercicio");
        console.log(newEjercicio);

        await EjercicioModel.create(newEjercicio);

        return showEjercicio;
      })
    );

    return processedEjercicios;
  }

  private async generateAIContent(ejercicio: any): Promise<{
    titulo: string;
    descripcion: string;
    duracion: number;
    dificultad: string;
  }> {
    const prompt = `
    Genera un título, una descripción breve, una duración estimada y un nivel de dificultad para un ejercicio de estimulación cognitiva basado en la siguiente información. Asegúrate de que:
    - El título sea claro, atractivo y refleje una actividad específica de estimulación cognitiva.
    - La descripción explique brevemente cómo realizar el ejercicio y para qué sirve, en un lenguaje sencillo y directo.
    - La duración esté en minutos (entre 5 y 30 minutos, según la complejidad del ejercicio) tipo number.
    - La dificultad sea "fácil", "media" o "difícil", considerando el tipo de actividad y la población objetivo.

    Información proporcionada:
    - Título actual: ${ejercicio.titulo}
    - Descripción actual: ${ejercicio.descripcion}

    Ejemplo de formato esperado:
    - Título: "Entrena tu Memoria con Asociación de Imágenes"
    - Descripción: "Este ejercicio te invita a asociar imágenes con palabras, reforzando tu capacidad de recordar información visual y verbal. Ideal para mejorar la memoria visual y auditiva."
    - duracion: 10
    - dificultad: fácil

    Ahora genera el título, la descripción, la duración y la dificultad adecuados:`;

    const openAIDto: OpenAIDto = { prompt };

    const openAIResponse = await this.openaiDatasource.generateText(
      openAIDto,
      EjercicioZod
    );

    if (!openAIResponse) {
      throw CustomError.badRequest("Error al generar contenido con IA.");
    }

    const { titulo, descripcion, duracion, dificultad } = openAIResponse;

    if (!duracion || typeof duracion !== "number") {
      throw CustomError.badRequest("La duración generada no es válida.");
    }

    if (
      !dificultad ||
      !["fácil", "media", "difícil"].includes(dificultad.toLowerCase())
    ) {
      throw CustomError.badRequest("La dificultad generada no es válida.");
    }

    return { titulo, descripcion, duracion, dificultad };
  }
}
