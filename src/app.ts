import express from "express";
import cors from "cors";
import { envs } from "./config";
import { MongoDatabase } from "./data";
import { AppRoutes } from "./presentation";
import { Cluster } from "puppeteer-cluster";
import { promises as fs } from "fs";
import { describe, it } from "node:test";

const app = express();

MongoDatabase.connect({
  dbName: envs.MONGO_DB_NAME,
  mongoURL: envs.MONGO_URL,
});

app.use(cors());
app.use(express.json());
app.use(AppRoutes.routes);

app.listen(envs.PORT, () => {
  console.log(`Listen port: ${envs.PORT}`);
});

// Iniciar el cluster con el número de workers deseado

// (async () => {
//   const fileName = "productos.csv";

//   // Inicializamos el archivo CSV con los encabezados
//   await fs.writeFile(fileName, "Title,Price,Image\n");

//   const cluster = await Cluster.launch({
//     concurrency: Cluster.CONCURRENCY_CONTEXT,
//     maxConcurrency: 3,
//     retryLimit: 5,
//     timeout: 30000,
//     puppeteerOptions: { args: ["--no-sandbox"] },
//   });

//   // Definir una tarea a realizar en cada página
//   await cluster.task(async ({ page, data: url }) => {
//     await page.goto(url, { waitUntil: "domcontentloaded" });

//     let isBtnDisabled = false;

//     while (!isBtnDisabled) {
//       await page.waitForSelector('[data-cel-widget="search_result_0"]');
//       const productsHandles = await page.$$(
//         "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
//       );

//       for (const productHandle of productsHandles) {
//         let title: string | null = null;
//         let price: string | null = null;
//         let img: string | null = null;

//         // Extraer título
//         try {
//           title = await page.evaluate((el) => {
//             const titleElement = el.querySelector("h2 > a > span");
//             return titleElement ? titleElement.textContent : null;
//           }, productHandle);
//         } catch (error) {
//           console.error("Error obteniendo el título:", error);
//         }

//         // Extraer precio
//         try {
//           price = await page.evaluate((el) => {
//             const priceElement = el.querySelector(".a-price > .a-offscreen");
//             return priceElement ? priceElement.textContent : null;
//           }, productHandle);
//         } catch (error) {
//           console.error("Error obteniendo el precio:", error);
//         }

//         // Extraer imagen
//         try {
//           img = await page.evaluate((el) => {
//             const imgElement = el.querySelector(".s-image");
//             return imgElement ? imgElement.getAttribute("src") : null;
//           }, productHandle);
//         } catch (error) {
//           console.error("Error obteniendo la imagen:", error);
//         }

//         // Guardar el producto si tiene título
//         if (title && typeof title === "string") {
//           try {
//             console.log(
//               `Guardando producto: ${title}, Precio: ${
//                 price || "N/A"
//               }, Imagen: ${img || "N/A"}`
//             );
//             await fs.appendFile(
//               fileName,
//               `${title.replace(/,/g, ".")},${price || "N/A"},${img || "N/A"}\n`
//             );
//           } catch (error) {
//             console.error("Error al guardar en el archivo:", error);
//           }
//         }
//       }

//       // Verificar si el botón "Siguiente" está deshabilitado
//       await page.waitForSelector("li.a-last", { visible: true });
//       const is_disabled = (await page.$("li.a-disabled.a-last")) !== null;

//       isBtnDisabled = is_disabled;
//       if (!is_disabled) {
//         await Promise.all([
//           page.click("li.a-last"),
//           page.waitForNavigation({ waitUntil: "networkidle2" }),
//         ]);
//       }
//     }
//   });

//   // Array con las URLs a procesar
//   const urls = [
//     "https://www.amazon.com/s?k=amazonbasics&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=EQNRr&pd_rd_wg=PygJX&pf_rd_p=9349ffb9-3aaa-476f-8532-6a4a5c3da3e7&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
//     "https://www.amazon.com/s?k=teclado&crid=2JHGMBQA9D44T&sprefix=teclado%2Caps%2C257&ref=nb_sb_noss_1",
//   ];

//   // Añadir las URLs al cluster
//   for (const url of urls) {
//     await cluster.queue(url);
//   }

//   // Cerrar el cluster cuando termine de procesar
//   await cluster.idle();
//   await cluster.close();
// })();
