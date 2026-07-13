import { createAiProvider } from "./factory";
import {
  buildChatMessages,
  buildEditMessages,
  buildGenerationMessages,
} from "./prompts/resume";
import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiProvider,
  AiProviderName,
  AiStreamEvent,
  ChatInput,
  ResumeEditInput,
  ResumeGenerationInput,
} from "./types";

export interface ResumeAiClientOptions {
  provider?: AiProviderName;
  apiKey?: string;
  model?: string;
}

export class ResumeAiClient {
  private provider: AiProvider;

  constructor(private options?: ResumeAiClientOptions) {
    console.log("[ResumeAiClient] Creating client with options:", {
      provider: options?.provider ?? "default",
      hasApiKey: !!options?.apiKey,
      model: options?.model ?? "default",
    });
    this.provider = createAiProvider(this.options?.provider, {
      apiKey: this.options?.apiKey,
      model: this.options?.model,
    });
    console.log("[ResumeAiClient] Provider created:", this.provider.name);
  }

  async generateResume(
    input: ResumeGenerationInput,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    const messages = buildGenerationMessages(input, input.formatLatex);
    console.log("[ResumeAiClient.generateResume] Messages built:", {
      messageCount: messages.length,
      hasFormatLatex: !!input.formatLatex,
      formatLatexLength: input.formatLatex?.length ?? 0,
    });
    return this.provider.complete(messages, options);
  }

  async editResume(
    input: ResumeEditInput,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    const messages = buildEditMessages(input, input.formatLatex);
    console.log("[ResumeAiClient.editResume] Messages built:", {
      messageCount: messages.length,
      hasFormatLatex: !!input.formatLatex,
      formatLatexLength: input.formatLatex?.length ?? 0,
    });
    return this.provider.complete(messages, options);
  }

  async chat(
    input: ChatInput,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult> {
    const messages = buildChatMessages(
      input.messages,
      input.systemPrompt,
      input.formatLatex,
      input.profile,
    );
    console.log("[ResumeAiClient.chat] Messages built:", {
      messageCount: messages.length,
      inputMessageCount: input.messages.length,
      hasFormatLatex: !!input.formatLatex,
      formatLatexLength: input.formatLatex?.length ?? 0,
      hasProfile: !!input.profile,
      profileLength: input.profile?.length ?? 0,
      systemPromptLength: messages[0]?.content.length ?? 0,
    });
    return this.provider.complete(messages, options);
  }

  async *streamChat(
    input: ChatInput,
    options?: AiCompletionOptions,
  ): AsyncIterable<AiStreamEvent> {
    const messages = buildChatMessages(
      input.messages,
      input.systemPrompt,
      input.formatLatex,
      input.profile,
    );
    console.log("[ResumeAiClient.streamChat] Messages built:", {
      messageCount: messages.length,
      inputMessageCount: input.messages.length,
      hasFormatLatex: !!input.formatLatex,
      formatLatexLength: input.formatLatex?.length ?? 0,
      hasProfile: !!input.profile,
      profileLength: input.profile?.length ?? 0,
      systemPromptLength: messages[0]?.content.length ?? 0,
      systemPromptPreview: messages[0]?.content.substring(0, 200),
      hasStream: !!this.provider.stream,
    });

    if (!this.provider.stream) {
      console.log(
        "[ResumeAiClient.streamChat] No stream method, using complete",
      );
      const result = await this.provider.complete(messages, options);
      console.log("[ResumeAiClient.streamChat] Complete result:", {
        contentLength: result.content.length,
        contentPreview: result.content.substring(0, 100),
      });
      yield { type: "content", text: result.content };
      yield { type: "done", usage: result.usage };
      return;
    }

    console.log("[ResumeAiClient.streamChat] Starting stream...");
    let eventCount = 0;
    for await (const event of this.provider.stream(messages, options)) {
      eventCount++;
      if (event.type === "content" && eventCount <= 3) {
        console.log(
          "[ResumeAiClient.streamChat] Event:",
          event.type,
          event.text.substring(0, 50),
        );
      }
      yield event;
    }
    console.log(
      "[ResumeAiClient.streamChat] Stream complete. Total events:",
      eventCount,
    );
  }
}

export function createResumeAiClient(
  options?: ResumeAiClientOptions,
): ResumeAiClient {
  return new ResumeAiClient(options);
}
