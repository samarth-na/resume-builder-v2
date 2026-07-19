"use client";

import {
  ArrowUp,
  ChevronDown,
  Copy,
  Loader2,
  Mic,
  MoreHorizontal,
  Plus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import type { ChatMessage, ResumeProject } from "@/lib/types";

type ChatPanelProps = {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
};

function extractLatex(text: string): string | null {
  const match = text.match(/\\documentclass[\s\S]*\\end\{document\}/);
  return match ? match[0] : null;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring";

export default function ChatPanel({ project, onUpdate }: ChatPanelProps) {
  const [prompt, setPrompt] = useState(project.meta.prompt);
  const [jobDescription, setJobDescription] = useState(
    project.meta.jobDescription,
  );
  const [company, setCompany] = useState(project.meta.company);
  const [tone, setTone] = useState(project.meta.tone);
  const [showOptions, setShowOptions] = useState(false);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState("");
  const [streamingContent, setStreamingContent] = useState("");

  const sendMessage = async () => {
    if (!prompt.trim() || sending) return;
    const instruction = prompt.trim();
    const newMeta = { prompt: instruction, jobDescription, company, tone };

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: instruction,
      timestamp: "Just now",
    };

    // Build conversation history for the API
    const chatHistory = [
      ...project.chat.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: instruction },
    ];

    // Add context about what to do
    const contextMessage = !project.latexCode.trim()
      ? `Generate a LaTeX resume. ${company ? `Target company: ${company}.` : ""} ${jobDescription ? `Job description: ${jobDescription}` : ""}`
      : `Edit the current resume. Current LaTeX:\n${project.latexCode}`;

    chatHistory.splice(chatHistory.length - 1, 0, {
      role: "user" as const,
      content: contextMessage,
    });

    console.log("[ChatPanel] Sending message:", {
      instruction,
      chatHistoryLength: chatHistory.length,
      chatHistory: chatHistory.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.substring(0, 80),
      })),
      hasExistingLatex: !!project.latexCode.trim(),
    });

    onUpdate({
      ...project,
      chat: [...project.chat, userMessage],
      meta: newMeta,
    });
    setPrompt("");
    setSending(true);
    setThinking("");
    setStreamingContent("");

    void fetch(`/api/workspaces/${project.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: instruction }),
    });

    let finalContent = "";
    let errorText: string | null = null;

    try {
      console.log("[ChatPanel] Fetching /api/chat...");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          systemPrompt: undefined,
        }),
      });

      console.log("[ChatPanel] Response status:", res.status);
      const data = await res.json();

      if (!res.ok) {
        errorText = data?.error ?? `Request failed (${res.status})`;
        console.error("[ChatPanel] Error:", errorText);
      } else {
        finalContent = data.content ?? "";
        console.log("[ChatPanel] Got content:", {
          length: finalContent.length,
          preview: finalContent.substring(0, 100),
          hasThinking: !!data.thinking,
        });
      }
    } catch (error) {
      errorText = error instanceof Error ? error.message : "Network error";
      console.error("[ChatPanel] Fetch error:", errorText);
    }

    const latex = extractLatex(finalContent);
    console.log("[ChatPanel] Processing result:", {
      finalContentLength: finalContent.length,
      extractedLatex: !!latex,
      latexLength: latex?.length ?? 0,
      errorText,
    });

    const assistantContent = errorText
      ? `Something went wrong: ${errorText}`
      : latex
        ? "Your resume has been generated. Review the preview and tell me if you'd like any adjustments."
        : finalContent || "No response received.";

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent,
      timestamp: "Just now",
    };

    onUpdate({
      ...project,
      chat: [...project.chat, userMessage, assistantMessage],
      meta: newMeta,
      latexCode: latex || project.latexCode,
    });

    void fetch(`/api/workspaces/${project.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "assistant", content: assistantContent }),
    });

    if (latex) {
      void fetch(`/api/workspaces/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latexCode: latex,
          meta: newMeta,
          targetRole: project.targetRole || newMeta.prompt,
        }),
      });
    }

    setSending(false);
    setThinking("");
    setStreamingContent("");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl space-y-5">
          {project.chat.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
              Ask ResumeCraft to generate your first resume, or describe changes
              you&apos;d like to make.
            </div>
          )}
          {project.chat.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3.5 py-2.5 ${
                  message.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-border bg-card text-card-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                  {message.content}
                </p>
                {message.role === "assistant" && (
                  <div className="mt-2.5 flex items-center gap-0.5 border-t border-border pt-2">
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <MoreHorizontal
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {sending && thinking && !streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-lg border border-chart-3/30 bg-chart-3/10 px-3.5 py-2.5">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-chart-3">
                  Thinking...
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-chart-3/70">
                  {thinking}
                </p>
              </div>
            </div>
          )}

          {/* Streaming content indicator */}
          {sending && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-lg border border-border bg-card px-3.5 py-2.5">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-chart-2">
                  Generating resume...
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                  Writing LaTeX code...
                </p>
              </div>
            </div>
          )}

          {/* Loading state before any tokens arrive */}
          {sending && !thinking && !streamingContent && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Working on your resume...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-xl space-y-3">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            {showOptions ? "Hide options" : "Add job context"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showOptions ? "rotate-180" : ""
              }`}
            />
          </button>

          {showOptions && (
            <div className="grid gap-3 rounded-lg border border-border bg-card p-3">
              <div>
                <label
                  htmlFor="role-title"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Role title
                </label>
                <input
                  id="role-title"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Generate a resume for..."
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="target-company"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Target company
                </label>
                <input
                  id="target-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="job-description"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Job description
                </label>
                <textarea
                  id="job-description"
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label
                  htmlFor="tone-style"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Tone / style
                </label>
                <select
                  id="tone-style"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={inputClass}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Technical</option>
                  <option>Confident</option>
                </select>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-3 shadow-md">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask ResumeCraft to edit your resume..."
              className="h-16 w-full resize-none bg-transparent px-2 py-1 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Build
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Mic className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!prompt.trim() || sending}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Make it more concise",
              "Add a projects section",
              "Use stronger action verbs",
              "Tailor for leadership roles",
            ].map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-input hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
