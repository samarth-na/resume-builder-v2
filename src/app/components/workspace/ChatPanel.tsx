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
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl space-y-6">
          {project.chat.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
              Ask ResumeCraft to generate your first resume, or describe changes
              you'd like to make.
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                {message.role === "assistant" && (
                  <div className="mt-3 flex items-center gap-1 border-t border-zinc-800/80 pt-2">
                    <button
                      type="button"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {sending && thinking && !streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl border border-amber-800/40 bg-amber-950/20 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Thinking...
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-amber-300/70">
                  {thinking}
                </p>
              </div>
            </div>
          )}

          {/* Streaming content indicator */}
          {sending && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                  Generating resume...
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                  Writing LaTeX code...
                </p>
              </div>
            </div>
          )}

          {/* Loading state before any tokens arrive */}
          {sending && !thinking && !streamingContent && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Working on your resume...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <div className="mx-auto max-w-xl space-y-3">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showOptions ? "Hide options" : "Add job context"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showOptions ? "rotate-180" : ""
              }`}
            />
          </button>

          {showOptions && (
            <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div>
                <label
                  htmlFor="role-title"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Role title
                </label>
                <input
                  id="role-title"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Generate a resume for..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="target-company"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Target company
                </label>
                <input
                  id="target-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="job-description"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Job description
                </label>
                <textarea
                  id="job-description"
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="tone-style"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Tone / style
                </label>
                <select
                  id="tone-style"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Technical</option>
                  <option>Confident</option>
                </select>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-3 shadow-lg">
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
              className="h-16 w-full resize-none bg-transparent px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  Build
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!prompt.trim() || sending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
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
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
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
