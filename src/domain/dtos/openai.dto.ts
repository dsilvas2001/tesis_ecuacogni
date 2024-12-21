export class OpenAIDto {
  private constructor(public prompt: any) {}

  static create(object: { [key: string]: any }): [string?, OpenAIDto?] {
    const { prompt } = object;

    if (!prompt) return ["Missing prompt"];

    return [undefined, new OpenAIDto(prompt)];
  }
}
