import { EjercicioGeneradoModel } from "../../data/mongodb/models/ejercicio-generado.model";
import { PromptChatGPTModel } from "../../data/mongodb/models/prompt-chatgpt.model";
import {
  CadenaBusquedaZod,
  EjercicioGeneradoDatasource,
  EjercicioGeneradoZod,
  OpenAIDto,
  SignosVitalesDto,
} from "../../domain";
import { OpenAIDatasourceImpl } from "./openai.datasource.impl";
import { ScraperResultDatasourceImpl } from "./scraper-result.datasource.impl";
import { ContenidoEjercicioModel } from "../../data/mongodb/models/contenido-ejercicio.model";
import { GoogleSearchDatasourceImpl } from "./google.datasource.impl";

export class EjercicioGeneradoDatasourceImpl
  implements EjercicioGeneradoDatasource
{
  private openaiDatasource = new OpenAIDatasourceImpl();
  private scraperDatasource = new ScraperResultDatasourceImpl();
  private googleSearchDatasource: GoogleSearchDatasourceImpl =
    new GoogleSearchDatasourceImpl();

  async generateEjercicio(
    categoria: string,
    numeroEjercicios: number,
    signosVitalesDto: SignosVitalesDto
  ): Promise<any[]> {
    const prompt = `
        Eres un asistente médico de IA especializado en el monitoreo y análisis de signos vitales de los pacientes. Debes generar una cadena de búsqueda en **español** para encontrar ejercicios de estimulación cognitiva basados en la categoría y los signos vitales proporcionados.  
          
        ### **Datos proporcionados:**  
        - **Categoría:** ${categoria}  
        - **Presión arterial:** ${
          signosVitalesDto.presion_arterial!.sistolica
        }/${signosVitalesDto.presion_arterial!.diastolica} mmHg  
        - **Frecuencia cardíaca:** ${signosVitalesDto.frecuencia_cardiaca} bpm  
        - **Frecuencia respiratoria:** ${
          signosVitalesDto.frecuencia_respiratoria
        } respiraciones/min  
        - **Temperatura:** ${signosVitalesDto.temperatura} °C  
          
        ### **Instrucciones:**  
        1. **Genera una cadena de búsqueda** clara y específica para encontrar ejercicios de estimulación cognitiva.  
        2. La cadena debe incluir la categoría y los signos vitales más relevantes.  
        3. Ejemplos de cadenas de búsqueda:  
           - "Ejercicios de memoria para pacientes con presión arterial baja y frecuencia cardíaca elevada".  
           - "Ejercicios de atención para pacientes con fiebre y taquicardia".  
           - "Ejercicios de lenguaje para pacientes con signos vitales estables".  
           - "Ejercicios de razonamiento para pacientes con estrés cardiovascular".  
      `;

    // Llamar a la IA para generar la cadena de búsqueda
    const openAIDto = OpenAIDto.create({ prompt })[1];
    const openAIResponse = await this.openaiDatasource.generateText(
      openAIDto!,
      CadenaBusquedaZod
    );

    // Paso 2: Invocar el web scraping con la cadena de búsqueda
    const resultadosScraping = await this.scraperDatasource.getScraperGeneral(
      openAIResponse.cadena
    );

    //EJERCICIOS
    // Paso 3: Generar ejercicios basados en la categoría y los resultados del scraping
    // const numeroEjercicios = 2; // Número de ejercicios a generar
    const ejerciciosGenerados = await this.generarEjercicios(
      categoria,
      resultadosScraping,
      numeroEjercicios
    );

    // Retornar los ejercicios generados
    return ejerciciosGenerados;
  }

  // Método para generar el prompt dinámico

  //   async generarEjercicios(
  //     categoria: string,
  //     resultadosScraping: any,
  //     numeroEjercicios: number
  //   ): Promise<any[]> {
  //     const ejercicios: any[] = [];

  //     for (let i = 0; i < numeroEjercicios; i++) {
  //       // Construir el prompt para ChatGPT
  //       const prompt = `
  //      Eres un asistente especializado en generar ejercicios de estimulación cognitiva.
  // Genera un ejercicio de la categoría "${categoria}" que ayude a mejorar habilidades como la memoria, la atención, el lenguaje o el razonamiento.

  // El ejercicio debe ser del tipo "seleccionar" o "completar", donde el usuario debe elegir la opción correcta entre varias opciones proporcionadas o completar una palabra/frase.

  // **Estructura del ejercicio:**
  // 1. **Título:** Un título descriptivo del ejercicio.
  // 2. **Descripción:** Breve explicación del propósito del ejercicio.
  // 3. **Instrucciones:** Claras y directas, indicando si se debe seleccionar la opción correcta o completar la palabra/frase.
  // 4. **Contenido:**
  //    - Si el ejercicio no requiere imágenes, proporciona solo el texto necesario.
  //    - Si el ejercicio requiere imágenes, busca las imágenes en Google Fotos y asigna **una única URL válida** a cada opción correspondiente en un array.
  //    - Ejemplo correcto:
  //    json
  //      {
  //        "opciones": [
  //          { "texto": "Banano", "imagen": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fcultivodeplatano.com%2F2011%2F09%2F22%2Fvariedades-de-banano%2F&psig=AOvVaw3twLqIuHbut0F7psh5SbHs&ust=1742348619473000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKDQz8vAkowDFQAAAAAdAAAAABAE" },
  //          { "texto": "Pera", "imagen": "https://www.google.com/url?sa=i&url=https%3A%2F%2Flibbys.es%2Fblog%2Fhabitos-saludables%2Fla-pera-refrescante-y-saludable%2F4410&psig=AOvVaw2NZn6O8cX6iFwqhVNy2R5_&ust=1742348592890000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJjB_bnAkowDFQAAAAAdAAAAABAE" },
  //          { "texto": "Manzana", "imagen": "https://www.google.com/imgres?q=manzana&imgurl=https%3A%2F%2Fwww.recetasnestle.com.ec%2Fsites%2Fdefault%2Ffiles%2Finline-images%2Ftipos-de-manzana-royal-gala.jpg&imgrefurl=https%3A%2F%2Fwww.recetasnestle.com.ec%2Fescuela-sabor%2Ftips-recetas%2Fmanzana-verde-y-roja&docid=pqm3SaLBGa6rjM&tbnid=8mRthNnHI7JklM&vet=12ahUKEwj-vIecwJKMAxWXSTABHXWBBFcQM3oECBwQAA..i&w=380&h=260&hcb=2&ved=2ahUKEwj-vIecwJKMAxWXSTABHXWBBFcQM3oECBwQAA" },
  //          { "texto": "Naranja", "imagen": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww3.gobiernodecanarias.org%2Fmedusa%2Fmediateca%2Fecoescuela%2F%3Fattachment_id%3D1951&psig=AOvVaw3RoGXX2xwm3LnRs8GyWf24&ust=1742348567813000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOjqwq7AkowDFQAAAAAdAAAAABAE" }
  //        ]
  //      }

  //      Cada opción debe tener una única imagen relacionada sin repetir ni dejar vacíos.
  // 5. **Opciones de respuesta:**
  //    - Para "seleccionar": Al menos 4 opciones con una única respuesta correcta.
  //    - Para "completar": Una sola palabra o frase correcta.
  // 6. **Respuesta correcta:** Debe estar claramente definida y ser única.

  // **Ejemplos de ejercicios generados:**
  // - Memoria: "Escucha la lista de compras y selecciona los elementos que estaban en la lista."
  // - Atención: "Mira la imagen y selecciona el objeto que no pertenece al grupo."
  // - Lenguaje: "Completa la siguiente frase: El sol sale por el __________."
  // - Razonamiento: "Selecciona el número que completa la secuencia: 2, 4, 6, __, 10."

  // **Reglas clave para la generación de ejercicios:**
  // - Las instrucciones deben ser claras y específicas.
  // - Si el ejercicio requiere imágenes, cada opción de respuesta debe tener una única URL de imagen obtenida de Google Fotos.
  // - La respuesta correcta debe estar bien definida y ser única.
  // - La estructura JSON debe ser válida y sin errores.

  // Genera la respuesta en formato JSON sin texto adicional.

  //     `;

  //       // Llamar a la API de ChatGPT para generar el ejercicio
  //       const openAIDto = OpenAIDto.create({ prompt })[1];
  //       const openAIResponse = await this.openaiDatasource.generateTextImage(
  //         openAIDto!,
  //         EjercicioGeneradoZod
  //       );

  //       // Validar y estructurar la respuesta de ChatGPT
  //       const ejercicioValidado = EjercicioGeneradoZod.parse(openAIResponse);
  //       ejercicios.push(ejercicioValidado);
  //     }

  //     return ejercicios;
  //   }

  async generarEjercicios(
    categoria: string,
    resultadosScraping: any,
    numeroEjercicios: number
  ): Promise<any[]> {
    const ejercicios: any[] = [];

    for (let i = 0; i < numeroEjercicios; i++) {
      // Construir el prompt para ChatGPT
      const prompt = `
      Eres un asistente especializado en generar ejercicios de estimulación cognitiva para adultos mayores (80 años en adelante). Tu objetivo es generar un ejercicio adaptado a la categoría "${categoria}", asegurando que sea claro, accesible y adecuado para esta edad.
      
      ## 📌 **Instrucciones Generales**
      - El ejercicio debe ser sencillo y comprensible, evitando términos complejos o instrucciones confusas.
      - Debe estar diseñado específicamente para estimular la **${categoria}**.
      - La presentación debe ser clara y estructurada.
      - Se pueden utilizar distintos formatos según la categoría, como ejercicios de completar frases, preguntas de opción múltiple, ejercicios de asociación o pequeños relatos con preguntas.
      
      ## 🧠 **Categorías y Formatos Recomendados**
      1. **Memoria** 🧠  
         - Ejercicios de recordar listas cortas de palabras o imágenes.  
         - Completar frases con palabras previamente mostradas.  
         - Relatos breves seguidos de preguntas sobre el contenido.  
      
      2. **Lenguaje** 🗣️  
         - Encontrar sinónimos o completar palabras faltantes en oraciones.  
         - Asociar imágenes con palabras.  
         - Formar palabras con letras dadas.  
      
      3. **Razonamiento** 🔢  
         - Problemas matemáticos básicos como sumas o secuencias numéricas.  
         - Identificación de patrones o relaciones lógicas entre elementos.  
         - Preguntas de verdadero o falso sobre conceptos sencillos.  
      
      ## 🔹 **Estructura del Ejercicio (Formato JSON)**
      Debe seguir este formato y SIEMPRE incluir opciones de respuesta (3):
      
      [
        {
          "titulo": "Ejemplo: Encuentra la Fruta Correcta",
          "descripcion": "Ejercicio de memoria donde debes recordar una fruta mencionada previamente.",
          "tipo": "completar",
          "dificultad": "baja",
          "instrucciones": "Selecciona la fruta correcta para completar la frase.",
          "contenido": {
            "tipo_contenido": "texto",
            "contenido": "La fruta que es roja y dulce es:"
          },
          "opciones": [
            { "texto": "Manzana", "imagen": "" },
            { "texto": "Plátano", "imagen": "" },
            { "texto": "Fresa", "imagen": "" },
            { "texto": "Naranja", "imagen": "" }
          ],
          "respuesta_correcta": ["Fresa"]
        }
      ]
      
      ⚠ **Reglas Importantes:**
      - **Todos los ejercicios deben incluir opciones de respuesta (mínimo 4).**
      - **Incluso los ejercicios de completar deben tener opciones.**
      - **La respuesta correcta debe coincidir con una de las opciones.**
      - **Las opciones deben ser variadas y lógicas según el contexto.**
      
      📢 **Ejemplo de una pregunta para la categoría "Razonamiento":**  
      Pregunta: ¿Cuánto es 2 + 2?  
      Opciones: 1, 2, 3, 4.  
      Respuesta correcta: 4.
      
      🔹 **Genera un ejercicio siguiendo estas reglas y adaptado a la categoría "${categoria}".**
      `;

      // Llamar a la API de ChatGPT para generar el ejercicio
      const openAIDto = OpenAIDto.create({ prompt })[1];
      const openAIResponse = await this.openaiDatasource.generateText(
        openAIDto!,
        EjercicioGeneradoZod
      );

      // Validar y estructurar la respuesta de ChatGPT
      const ejercicioValidado = EjercicioGeneradoZod.parse(openAIResponse);

      // Buscar URLs de imágenes para todas las opciones
      const opcionesConImagenes = await Promise.all(
        ejercicioValidado.contenido.opciones.map(
          async (opcion: { texto: string; imagen?: string }) => {
            try {
              let imagenUrl = "";
              if (opcion.texto.trim() !== "") {
                imagenUrl =
                  (await this.googleSearchDatasource.getFirstImageUrl(
                    opcion.texto
                  )) || "URL_DE_IMAGEN_POR_DEFECTO";
                console.log(
                  `Buscando imagen para: ${opcion.texto} -> ${imagenUrl}`
                );
              }
              return {
                texto: opcion.texto,
                imagen: imagenUrl || "URL_DE_IMAGEN_POR_DEFECTO", // Imagen por defecto si no encuentra
              };
            } catch (error) {
              console.error(
                `Error al buscar imagen para "${opcion.texto}":`,
                error
              );
              return {
                texto: opcion.texto,
                imagen: "URL_DE_IMAGEN_POR_DEFECTO", // Imagen fallback
              };
            }
          }
        )
      );

      // Reemplazar las opciones con las opciones que incluyen URLs de imágenes
      ejercicioValidado.contenido.opciones = opcionesConImagenes;

      ejercicios.push(ejercicioValidado);
    }

    return ejercicios;
  }

  recomendacionEjercicio = async (resultados: any): Promise<any> => {};
}
