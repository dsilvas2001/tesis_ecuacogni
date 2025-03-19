import OpenAI from "openai";
import { envs } from "../../config";
import { OpenAIDatasource, OpenAIDto, OpenAIEntity } from "../../domain";
import { string, unknown, z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { CustomError } from "../errors/custom.error";
import { OpenAIMapper } from "../mappers/openai.mapper";

export class OpenAIDatasourceImpl implements OpenAIDatasource {
  private openai: OpenAI;
  private responseContent: any;

  constructor() {
    this.openai = new OpenAI({
      apiKey: envs.OPENAI_API_KEY,
    });
  }

  async generateText<T>(
    openAIDto: OpenAIDto,
    schema: z.ZodType<T>
  ): Promise<T> {
    const { prompt } = openAIDto;

    try {
      const completion = await this.openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto. Proporciona respuestas claras y estructuradas.",
          },
          { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(schema, "parsed_content"),
      });

      const parsedContent = completion.choices[0].message?.parsed;

      if (!parsedContent) {
        throw CustomError.badRequest("Invalid response from OpenAI.");
      }

      // Validar con Zod
      const validatedData = schema.parse(parsedContent);

      return validatedData;
    } catch (error) {
      console.error("Error details:", error);
      throw CustomError.internalServer("Failed to generate text.");
    }
  }
  async generateTextImage<T>(
    openAIDto: OpenAIDto,
    schema: z.ZodType<T>
  ): Promise<T> {
    const { prompt } = openAIDto;

    try {
      const completion = await this.openai.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto. Proporciona respuestas claras y estructuradas.",
          },
          { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(schema, "parsed_content"),
      });

      const parsedContent = completion.choices[0].message?.parsed;

      if (!parsedContent) {
        throw CustomError.badRequest("Invalid response from OpenAI.");
      }

      // Validar con Zod
      const validatedData = schema.parse(parsedContent);

      return validatedData;
    } catch (error) {
      console.error("Error details:", error);
      throw CustomError.internalServer("Failed to generate text.");
    }
  }
}
