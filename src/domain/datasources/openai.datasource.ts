import { z } from "zod";
import { OpenAIDto } from "../dtos/openai.dto";
import { OpenAIEntity } from "../entities/openai.entity";

export abstract class OpenAIDatasource {
  abstract generateText<T>(
    openAIDto: OpenAIDto,
    schema: z.ZodType<T>
  ): Promise<T>;
}
