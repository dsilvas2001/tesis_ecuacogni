import { Cluster } from "puppeteer-cluster";
import {
  CategoriasDatasource,
  CategoriasDto,
  CategoriaZod,
  OpenAIDto,
} from "../../domain";
import { CategoriaModel } from "../../data/mongodb/models";
import { CategoriasMapper } from "../mappers/categorias.mapper";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";

export class CategoriasDatasourceImpl implements CategoriasDatasource {
  private openaiDatasource = new OpenAIDatasourceImpl();

  async getCategoriasJson(): Promise<any[]> {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 3,
      retryLimit: 5,
      timeout: 30000,
      puppeteerOptions: { args: ["--no-sandbox"] },
    });

    const results: CategoriasDto[] = [];

    await cluster.task(async ({ page, data: url }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const categoriaData = await page.evaluate(() => {
        const nombre =
          document.querySelector("h1")?.textContent?.trim() || "No disponible";
        const descripcion =
          Array.from(document.querySelectorAll("p"))
            .slice(0, 2)
            .map((p) => p.textContent?.trim())
            .join(" ") || "No disponible";

        return {
          nombre,
          descripcion,
        };
      });

      results.push(categoriaData);
    });

    const urls = [
      "https://www.bitbrain.com/es/blog/ejercicios-estimulacion-cognitiva",
      "https://www.neuropsicologiagdb.com/cuadernos",
      "https://cerebroagil.com/actividades-de-estimulacion-cognitiva/",
      "https://neuronup.com/estimulacion-y-rehabilitacion-cognitiva/10-ejercicios-de-estimulacion-cognitiva/",
    ];

    for (const url of urls) {
      await cluster.queue(url);
    }

    await cluster.idle();
    await cluster.close();

    return await this.saveCategorias(results);
  }

  public async saveCategorias(categorias: any[]): Promise<any[]> {
    try {
      const processedCategorias = await Promise.all(
        categorias.map(async (categoria) => {
          const prompt = `
          Based on the provided information, please provide the following:
          - The most suitable category of cognitive stimulation exercises (choose one from: Memoria, Atención y concentración, Lenguaje, Razonamiento, Cálculo).
          - A concise and clear description of this category (maximum 17 words).

          Information:
          - Current Name: ${categoria.nombre}
          - Current Description: ${categoria.descripcion}`;

          const openAIDto = OpenAIDto.create({ prompt })[1];
          const openAIResponse = await this.openaiDatasource.generateText(
            openAIDto!,
            CategoriaZod
          );

          return {
            ...categoria,
            ...openAIResponse,
          };
        })
      );

      const resolvedCategorias = await Promise.all(
        processedCategorias.map(async (categoria) => {
          const existing = await CategoriaModel.findOne({
            nombre: categoria.nombre,
          });
          return existing
            ? CategoriasMapper.categoriaEntityFromObject(existing)
            : categoria;
        })
      );

      const toSave = resolvedCategorias.filter(
        (categoria) => !("id" in categoria || "_id" in categoria)
      );

      if (toSave.length > 0) {
        const uniqueToSave = toSave.filter(
          (categoria, index, self) =>
            self.findIndex((c) => c.nombre === categoria.nombre) === index
        );

        if (uniqueToSave.length > 0) {
          const savedCategorias = await CategoriaModel.insertMany(uniqueToSave);

          resolvedCategorias.forEach((categoria, index) => {
            if (!("id" in categoria || "_id" in categoria)) {
              const savedCategoria = savedCategorias.shift();
              if (savedCategoria && savedCategoria._id) {
                resolvedCategorias[index] =
                  CategoriasMapper.categoriaEntityFromObject(savedCategoria);
              }
            }
          });
        }
      }

      return resolvedCategorias;
    } catch (error) {
      console.error("Error saving categorias data:", error);
      throw new Error("Error saving categorias data");
    }
  }
}
