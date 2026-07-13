import type { AiProvider, AiProviderName } from "@/lib/ai/types";
import { NvidiaProvider, OpenAiProvider } from "./providers";

export interface AiProviderOptions {
  apiKey?: string;
  model?: string;
}

export function createAiProvider(
  name?: AiProviderName,
  options?: AiProviderOptions,
): AiProvider {
  const provider =
    name ?? (process.env.AI_PROVIDER as AiProviderName) ?? "openai";

  switch (provider) {
    case "openai":
      return new OpenAiProvider(options?.apiKey, options?.model);
    case "nvidia":
      return new NvidiaProvider(options?.apiKey, options?.model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
