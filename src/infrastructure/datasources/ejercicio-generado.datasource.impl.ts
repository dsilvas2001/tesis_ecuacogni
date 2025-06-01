import { EjercicioGeneradoModel } from "../../data/mongodb/models/ejercicio-generado.model";
import { PromptChatGPTModel } from "../../data/mongodb/models/prompt-chatgpt.model";
import {
  CadenaBusquedaZod,
  EjercicioGeneradoDatasource,
  EjercicioGeneradoZod,
  OpenAIDto,
  RecomendacionesZod,
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
    Eres un asistente especializado en generar ejercicios de estimulación cognitiva para adultos mayores (80 años en adelante). Tu objetivo es generar un ejercicio adaptado a la categoría "\${categoria}", asegurando que sea claro, accesible y adecuado para esta edad.
    
    ## 📌 Instrucciones Generales
    - El ejercicio debe ser sencillo, comprensible y utilizar un lenguaje claro.
    - Debe estar diseñado específicamente para estimular la **\${categoria}**.
    - La presentación debe ser clara, con estructura definida y visualmente atractiva.
    - Se deben incluir **opciones de respuesta (mínimo 4)**, incluso en ejercicios de completar.
    - La respuesta correcta debe coincidir con una de las opciones, y las opciones deben ser variadas y lógicas según el contexto.
    
    ## 🧠 Categorías y Formatos Recomendados
    
    1. **Memoria** 🧠  
       - Ejercicios que inviten a recordar datos o pequeñas anécdotas.  
       - Ejemplos:  
         - Recordar fragmentos de historias breves (por ejemplo, una cápsula histórica sobre Ecuador, como "La Independencia de Ecuador").  
         - Ejercicios de recordar secuencias o listas de palabras.
       - **Ejemplo:**  
         *"La siguiente historia narra hechos importantes de Ecuador. Lee el siguiente párrafo y luego selecciona cuál de las siguientes afirmaciones es correcta:"*
    
    2. **Lenguaje** 🗣️  
       - Ejercicios enfocados en la comprensión y estructuración del lenguaje.  
       - Ejemplos:  
         - Completar oraciones, identificar errores o formar palabras.  
         - Ejercicio tipo relato: *"Juan lleva a su perro al parque"*, donde se puede pedir que el adulto complete la oración o responda una pregunta sobre el relato.
       - **Ejemplo:**  
         *"Lee la siguiente oración: 'Juan lleva a su ___ al parque'. Selecciona la opción que complete correctamente la frase."*
    
    3. **Atencion** 🔢  
       - Ejercicios que requieran identificar patrones o reconocer palabras faltantes en un contexto.  
       - Ejemplos:  
         - Ejercicios de atención en el que se debe seleccionar la opción que completa correctamente una secuencia o frase.  
         - Problemas matemáticos sencillos (como '2+2') o identificar diferencias en imágenes.
       - **Ejemplo:**  
         *"Observa la siguiente secuencia: 2, 4, __, 8. ¿Cuál es el número que falta?"*
    
    ## 🔹 Estructura del Ejercicio (Formato JSON)
    Debe seguir el siguiente formato, y **SIEMPRE incluir opciones de respuesta (mínimo 4)**:
    
    [
      {
        "titulo": "Ejemplo: Encuentra la Fruta Correcta",
        "descripcion": "Ejercicio de memoria en el que debes recordar una fruta mencionada previamente.",
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
    - **Incluso en ejercicios de completar deben presentarse opciones.**
    - **La respuesta correcta debe coincidir con una de las opciones.**
    - **Las opciones deben ser variadas y coherentes con el contexto.**
    
    📢 **Ejemplo de una pregunta para la categoría "Razonamiento":**  
    Pregunta: ¿Cuánto es 2 + 2?  
    Opciones: 1, 2, 3, 4.  
    Respuesta correcta: 4.
    
    🔹 **Genera un ejercicio siguiendo estas reglas y adaptado a la categoría "\${categoria}".**
    
    **Notas adicionales según la categoría:**  
    - Si **\${categoria}** es "Lenguaje", enfoca el ejercicio en comprender y completar relatos o identificar errores en oraciones.  
    - Si es "Memoria", crea ejercicios basados en recordar pequeños fragmentos históricos o listas simples de palabras o datos relevantes (por ejemplo, hechos históricos de Ecuador).  
    - Si es "Atención" o "Razonamiento", diseña ejercicios que involucren identificar patrones o completar secuencias, asegurando que sean intuitivos y directos para la población adulta mayor.
    
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

  async generarEjercicios(
    categoria: string,
    resultadosScraping: any,
    numeroEjercicios: number
  ): Promise<any[]> {
    const ejerciciosPromises = Array.from({ length: numeroEjercicios }).map(
      async (_, i) => {
        // Bloque condicional para instrucciones específicas por categoría
        const categorySpecificPrompt = (() => {
          switch (categoria.toLowerCase()) {
            case "lenguaje":
              return `
        Para ejercicios de Lenguaje:
        - Usa relatos breves que describan situaciones cotidianas.
        - El enunciado debe incluir dos partes: "Relato:" (una o dos oraciones) y "Pregunta:" (la interrogante derivada del relato).
        - Ejemplo: 
          "Relato: Juan salió a caminar por el parque y se encontró con un viejo amigo. 
          Pregunta: ¿Con quién se encontró?"
        - Todas las opciones de respuesta deben ser de una sola palabra.
              `;
            case "memoria":
              return `
        Para ejercicios de Memoria:
        - Usa relatos breves que rememoren un suceso o anécdota sencilla, ya sea histórica o cotidiana.
        - El enunciado debe dividirse en "Relato:" (máximo 1-2 oraciones) y "Pregunta:" (la interrogante enfocada en recordar un detalle).
        - Ejemplo: 
          "Relato: Ana preparó una sopa caliente y deliciosa para la cena. 
          Pregunta: ¿Qué preparó?"
        - Las opciones deben ser de una sola palabra.
              `;
            case "atencion":
            case "razonamiento":
              return `
        Para ejercicios de Atención y Razonamiento:
        - Emplea secuencias, patrones o problemas sencillos que requieran identificar un elemento faltante o la lógica detrás de una serie.
        - El enunciado debe incluir "Relato:" (por ejemplo, una secuencia) y "Pregunta:" (de forma directa).
        - Ejemplo: 
          "Relato: 2, 4, __, 8. 
          Pregunta: ¿Cuál es el número que falta?"
        - Las opciones (que pueden ser números o palabras) deben ser de una sola palabra.
              `;
            default:
              return `
        Utiliza un formato sencillo y directo, adaptado a adultos mayores.
              `;
          }
        })();

        // Construir el prompt para ChatGPT (manteniendo el contenido original)
        const prompt = `
        Eres un asistente especializado en generar ejercicios de estimulación cognitiva para adultos mayores (80 años en adelante). Tu objetivo es crear ejercicios simples, atractivos y adaptados a la categoría "${categoria}", utilizando un lenguaje claro, cotidiano y directo.

        ## 📌 Instrucciones Generales
        - Cada ejercicio debe incluir un **Relato** y una **Pregunta**. El relato debe ser breve (máximo 1-2 oraciones) y la pregunta debe formularse de forma explícita.
        - Todas las opciones de respuesta deben ser de **una sola palabra**.
        - La respuesta correcta debe coincidir exactamente con una de las opciones.
        - El contenido y las opciones deben ser coherentes, variadas y adecuados para adultos mayores.

        ${categorySpecificPrompt}

        ## 🔹 Estructura del Ejercicio (Formato JSON)
        El ejercicio debe seguir el siguiente formato:

        [
          {
            "titulo": "Ejercicio de ${categoria}: Relato y Pregunta",
            "descripcion": "Ejercicio en el que debes leer un breve relato y responder la pregunta formulada, seleccionando una sola palabra.",
            "tipo": "completar",
            "dificultad": "baja",
            "instrucciones": "Lee el enunciado, que se divide en 'Relato:' y 'Pregunta:', y selecciona la respuesta correcta.",
            "contenido": {
              "tipo_contenido": "texto",
              "contenido": "Relato: María fue al mercado y compró manzanas frescas. Pregunta: ¿Qué compró?"
            },
            "opciones": [
              { "texto": "manzanas", "imagen": "https://images.unsplash.com/photo-1631342994537-34291c2ad1c6?crop=entropy&cs=srgb&fm=jpg&q=85" },
              { "texto": "peras", "imagen": "https://images.unsplash.com/photo-1574207967175-7e1318661137?crop=entropy&cs=srgb&fm=jpg&q=85" },
              { "texto": "naranjas", "imagen": "https://images.unsplash.com/photo-1505676707757-405c0fc83b56?crop=entropy&cs=srgb&fm=jpg&q=85" },
              { "texto": "uvas", "imagen": "https://images.unsplash.com/photo-1509680415089-7f6c7d90d8a0?crop=entropy&cs=srgb&fm=jpg&q=85" }
            ],
            "respuesta_correcta": ["manzanas"]
          }
        ]

        ⚠ **Reglas Importantes:**
        - Cada ejercicio debe incluir al menos 4 opciones de respuesta, y cada opción debe ser **una sola palabra**.
        - El enunciado debe contener un relato breve y una pregunta clara, separadas por etiquetas (por ejemplo, "Relato:" y "Pregunta:").
        - La respuesta correcta debe coincidir exactamente con una de las opciones.
        - Asegúrate de que el relato, la pregunta y las opciones sean coherentes, atractivos y adaptados a un nivel sencillo para adultos mayores.

        📢 **Ejemplo Adicional para "Atención y Razonamiento":**  
        - Contenido: "Relato: 2, 4, __, 8. Pregunta: ¿Cuál es el número que falta?"  
        - Opciones: "6", "5", "7", "9"  
        - Respuesta correcta: "6".

        🔹 **Genera un ejercicio siguiendo estas reglas y adaptado a la categoría "${categoria}".**
        `;

        // Llamar a la API de ChatGPT para generar el ejercicio
        const openAIDto = OpenAIDto.create({ prompt })[1];
        const openAIResponse = await this.openaiDatasource.generateTextImage(
          openAIDto!,
          EjercicioGeneradoZod
        );

        // Validar y estructurar la respuesta de ChatGPT
        const ejercicioValidado = EjercicioGeneradoZod.parse(openAIResponse);

        // Buscar URLs de imágenes para todas las opciones sin usar caché
        const opcionesConImagenes = await Promise.all(
          ejercicioValidado.contenido.opciones.map(
            async (opcion: { texto: string; imagen?: string }) => {
              const trimmedText = opcion.texto.trim();
              if (!trimmedText) {
                return {
                  texto: opcion.texto,
                  imagen: "URL_DE_IMAGEN_POR_DEFECTO",
                };
              }
              try {
                const imagenUrl =
                  (await this.googleSearchDatasource.getFirstImageUrl(
                    trimmedText
                  )) || "URL_DE_IMAGEN_POR_DEFECTO";
                console.log(
                  `Buscando imagen para: ${trimmedText} -> ${imagenUrl}`
                );
                return { texto: opcion.texto, imagen: imagenUrl };
              } catch (error) {
                console.error(
                  `Error al buscar imagen para "${trimmedText}":`,
                  error
                );
                return {
                  texto: opcion.texto,
                  imagen: "URL_DE_IMAGEN_POR_DEFECTO",
                };
              }
            }
          )
        );

        // Reemplazar las opciones con las que incluyen URLs de imágenes
        ejercicioValidado.contenido.opciones = opcionesConImagenes;
        return ejercicioValidado;
      }
    );

    // Espera a que se resuelvan todas las promesas y retorna el array final
    const ejerciciosGenerados = await Promise.all(ejerciciosPromises);
    return ejerciciosGenerados;
  }

  async generateRecomendaciones(
    tendencia: string,
    porcentajeExito: number,
    tiempoTranscurrido: number
  ): Promise<any> {
    const prompt = `
    Eres un asistente especializado en generar recomendaciones de ejercicios de estimulación cognitiva para adultos mayores. A continuación, te proporciono información sobre el desempeño de un usuario en un quiz:

    - **Tendencia de errores:** ${tendencia}
    - **Porcentaje de éxito:** ${porcentajeExito}%
    - **Tiempo transcurrido:** ${tiempoTranscurrido} segundos

    ## 📌 Instrucciones Generales
    - Genera recomendaciones personalizadas basadas en la tendencia de errores.
    - Sugiere ejercicios que ayuden a mejorar las áreas donde el usuario tuvo dificultades.
    - Destaca las fortalezas del usuario y sugiere cómo puede seguir mejorando.

    ## 🧠 Categorías de Ejercicios Recomendados
    1. **Memoria** 🧠  
       - Ejercicios que inviten a recordar datos o pequeñas anécdotas.
    2. **Lenguaje** 🗣️  
       - Ejercicios enfocados en la comprensión y estructuración del lenguaje.
    3. **Atención** 🔢  
       - Ejercicios que requieran identificar patrones o reconocer palabras faltantes.

    ## 🔹 Estructura de la Respuesta (Formato JSON)
    La respuesta debe seguir el siguiente formato:
    {
      "tendencia": "Descripción de la tendencia de errores",
      "recomendaciones": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
      "fortalezas": ["Fortaleza 1", "Fortaleza 2"]
    }

    ⚠ **Reglas Importantes:**
    - Las recomendaciones deben ser claras y específicas.
    - Las fortalezas deben basarse en el porcentaje de éxito y el tiempo transcurrido.

    🔹 **Genera recomendaciones siguiendo estas reglas y adaptadas a la información proporcionada.**
  `;

    // Llamar a la IA para generar la cadena de búsqueda
    const openAIDto = OpenAIDto.create({ prompt })[1];
    const openAIResponse = await this.openaiDatasource.generateText(
      openAIDto!,
      RecomendacionesZod
    );
    // Retornar las recomendaciones generadas
    return openAIResponse;
  }
}
