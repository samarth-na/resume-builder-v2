export type AiProviderName = "openai" | "nvidia";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface AiCompletionResult {
  content: string;
  thinking?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type AiStreamEvent =
  | { type: "thinking"; text: string }
  | { type: "content"; text: string }
  | { type: "done"; usage?: AiCompletionResult["usage"] };

export interface AiProvider {
  readonly name: AiProviderName;
  complete(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResult>;
  stream?(
    messages: AiMessage[],
    options?: AiCompletionOptions,
  ): AsyncIterable<AiStreamEvent>;
}

export interface ResumeGenerationInput {
  profile: string;
  targetRole: string;
  company?: string;
  jobDescription?: string;
  tone?: string;
  extraInstructions?: string;
  formatLatex?: string;
}

export interface ResumeEditInput {
  currentLatex: string;
  profile: string;
  instruction: string;
  targetRole?: string;
  company?: string;
  tone?: string;
  formatLatex?: string;
}

export interface ChatInput {
  messages: AiMessage[];
  systemPrompt?: string;
  formatLatex?: string;
  profile?: string;
}
