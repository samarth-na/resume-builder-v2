import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiMessage,
  AiProvider,
} from "@/lib/ai/types";

export abstract class BaseAiProvider implements AiProvider {
  abstract readonly name: AiProvider["name"];

  abstract complete(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult>;

  protected mergeOptions(
    defaults: Required<AiCompletionOptions>,
    options?: AiCompletionOptions,
  ): Required<AiCompletionOptions> {
    return {
      model: options?.model ?? defaults.model,
      temperature: options?.temperature ?? defaults.temperature,
      maxTokens: options?.maxTokens ?? defaults.maxTokens,
      topP: options?.topP ?? defaults.topP,
      stream: options?.stream ?? defaults.stream,
    };
  }
}
