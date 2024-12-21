import { OpenAIEntity } from "../../domain";

export class OpenAIMapper {
  static GenerateEntityFromObject(object: { [key: string]: any }) {
    return new OpenAIEntity(object);
  }
}
