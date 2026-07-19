import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiMessage,
  AiStreamEvent,
} from "@/lib/ai/types";
import { BaseAiProvider } from "./base";

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export class NvidiaProvider extends BaseAiProvider {
  readonly name = "nvidia" as const;
  private apiKey: string;
  private baseUrl: string;
  private defaults: Required<AiCompletionOptions>;

  constructor(
    apiKey?: string,
    model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct",
  ) {
    super();
    const key = apiKey ?? process.env.NVIDIA_API_KEY;
    if (!key) {
      throw new Error(
        "NVIDIA API key is missing. Set NVIDIA_API_KEY in your environment.",
      );
    }
    this.apiKey = key;
    this.baseUrl = process.env.NVIDIA_BASE_URL ?? DEFAULT_NVIDIA_BASE_URL;
    this.defaults = {
      model,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      stream: false,
    };
    console.log("[NvidiaProvider] Initialized:", {
      baseUrl: this.baseUrl,
      model,
      hasApiKey: !!key,
    });
  }

  async complete(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    const opts = this.mergeOptions(this.defaults, options);
    const requestBody = {
      model: opts.model,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      top_p: opts.topP,
      stream: false,
    };
    console.log("[NvidiaProvider.complete] Request:", {
      url: `${this.baseUrl}/chat/completions`,
      model: opts.model,
      messageCount: messages.length,
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.substring(0, 100),
      })),
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[NvidiaProvider.complete] Response status:", response.status);

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "[NvidiaProvider.complete] API error:",
        response.status,
        body,
      );
      throw new Error(`NVIDIA API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";
    const thinking = choice?.message?.reasoning_content ?? undefined;

    console.log("[NvidiaProvider.complete] Result:", {
      contentLength: content.length,
      contentPreview: content.substring(0, 200),
      hasThinking: !!thinking,
      thinkingLength: thinking?.length ?? 0,
      usage: data.usage,
    });

    return {
      content,
      thinking,
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
    const requestBody = {
      model: opts.model,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      top_p: opts.topP,
      stream: true,
    };

    console.log("[NvidiaProvider.stream] Starting stream:", {
      url: `${this.baseUrl}/chat/completions`,
      model: opts.model,
      messageCount: messages.length,
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.substring(0, 100),
      })),
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[NvidiaProvider.stream] Response status:", response.status);

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "[NvidiaProvider.stream] API error:",
        response.status,
        body,
      );
      throw new Error(`NVIDIA API error ${response.status}: ${body}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error("[NvidiaProvider.stream] No response body reader!");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let chunkCount = 0;
    let thinkingCount = 0;
    let contentCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("[NvidiaProvider.stream] Reader done. Stats:", {
          chunkCount,
          thinkingCount,
          contentCount,
        });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          console.log("[NvidiaProvider.stream] Received [DONE]");
          yield { type: "done" };
          return;
        }

        try {
          const chunk = JSON.parse(payload);
          chunkCount++;
          const delta = chunk.choices?.[0]?.delta;

          if (delta?.reasoning_content) {
            thinkingCount++;
            yield { type: "thinking", text: delta.reasoning_content };
          }
          if (delta?.content) {
            contentCount++;
            yield { type: "content", text: delta.content };
          }

          if (!delta?.reasoning_content && !delta?.content) {
            console.log(
              "[NvidiaProvider.stream] Chunk with no content:",
              JSON.stringify(chunk).substring(0, 200),
            );
          }
        } catch {
          console.warn(
            "[NvidiaProvider.stream] Malformed chunk:",
            payload.substring(0, 100),
          );
        }
      }
    }

    console.log("[NvidiaProvider.stream] Stream ended without [DONE]. Stats:", {
      chunkCount,
      thinkingCount,
      contentCount,
    });
    yield { type: "done" };
  }
}
