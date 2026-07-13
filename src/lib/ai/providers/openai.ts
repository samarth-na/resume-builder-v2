import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiMessage,
  AiStreamEvent,
} from "@/lib/ai/types";
import { BaseAiProvider } from "./base";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

export class OpenAiProvider extends BaseAiProvider {
  readonly name = "openai" as const;
  private apiKey: string;
  private baseUrl: string;
  private defaults: Required<AiCompletionOptions>;

  constructor(apiKey?: string, model = "gpt-4o-mini") {
    super();
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OpenAI API key is missing. Set OPENAI_API_KEY in your environment.",
      );
    }
    this.apiKey = key;
    this.baseUrl = process.env.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL;
    this.defaults = {
      model,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      stream: false,
    };
  }

  async complete(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    const opts = this.mergeOptions(this.defaults, options);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): AsyncIterable<AiStreamEvent> {
    const opts = this.mergeOptions(this.defaults, { ...options, stream: true });
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${body}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          yield { type: "done" };
          return;
        }

        try {
          const chunk = JSON.parse(payload);
          const delta = chunk.choices?.[0]?.delta;

          if (delta?.reasoning_content) {
            yield { type: "thinking", text: delta.reasoning_content };
          }
          if (delta?.content) {
            yield { type: "content", text: delta.content };
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    yield { type: "done" };
  }
}
