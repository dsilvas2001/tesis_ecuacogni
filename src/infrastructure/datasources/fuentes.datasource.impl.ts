import { FuentesDatasource, FuentesDto, FuentesEntity } from "../../domain";
import { Cluster } from "puppeteer-cluster";

import { FuenteModel } from "../../data/mongodb/models/fuentes.model";
import { CustomError } from "../errors/custom.error";
import { FuentesMapper } from "../mappers/fuentes.mapper";
import { any } from "zod";

export class FuentesDatasourceImpl implements FuentesDatasource {
  async getFuentesJson(): Promise<any[]> {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 3,
      retryLimit: 5,
      timeout: 30000,
      puppeteerOptions: { args: ["--no-sandbox"] },
    });

    const results: FuentesDto[] = [];

    await cluster.task(async ({ page, data: url }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const fuenteData = await page.evaluate(() => {
        const nombre =
          document.querySelector("h1")?.textContent?.trim() || "No disponible";
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
          "No disponible";

        return {
          nombre,
          url: window.location.href,
          autor,
        };
      });

      results.push(fuenteData);
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

    return await this.saveFuentes(results);
  }

  public async saveFuentes(fuentes: any[]): Promise<any[]> {
    try {
      const filteredFuentes = await Promise.all(
        fuentes.map(async (fuente) => {
          const existing = await FuenteModel.findOne({ url: fuente.url });

          return existing
            ? FuentesMapper.fuenteEntityFromObject(existing)
            : fuente;
        })
      );

      const toSave = filteredFuentes.filter(
        (fuente) => !("id" in fuente || "_id" in fuente)
      );
      if (toSave.length === 0) {
        return filteredFuentes;
      }

      const savedFuentes = await FuenteModel.insertMany(toSave);

      const orderedFuentes = fuentes.map((fuente) =>
        [...savedFuentes, ...filteredFuentes].find(
          (processedFuente) => processedFuente.url === fuente.url
        )
      );

      return orderedFuentes.map((ejercicio) =>
        FuentesMapper.fuenteEntityFromObject(ejercicio)
      );
    } catch (error) {
      console.error("Error saving fuentes data:", error);
      throw CustomError.internalServer("Error saving fuentes data");
    }
  }
}
