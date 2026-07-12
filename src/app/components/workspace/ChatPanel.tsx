"use client";

import {
  ArrowUp,
  ChevronDown,
  Copy,
  Mic,
  MoreHorizontal,
  Plus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import type { ChatMessage, ResumeProject } from "@/lib/types";

export default function ChatPanel({
  project,
  onUpdate,
}: {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
}) {
  const [prompt, setPrompt] = useState(project.meta.prompt);
  const [jobDescription, setJobDescription] = useState(
    project.meta.jobDescription,
  );
  const [company, setCompany] = useState(project.meta.company);
  const [tone, setTone] = useState(project.meta.tone);
  const [showOptions, setShowOptions] = useState(false);

  const sendMessage = () => {
    if (!prompt.trim()) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: "Just now",
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "I've updated the LaTeX draft based on your request. Review it in the preview panel and let me know if you'd like any adjustments.",
      timestamp: "Just now",
    };
    onUpdate({
      ...project,
      chat: [...project.chat, userMessage, assistantMessage],
      meta: { ...project.meta, prompt, jobDescription, company, tone },
    });
    setPrompt("");
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl space-y-6">
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
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Role title
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Generate a resume for..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Target company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Job description
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Tone / style
                </label>
                <select
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
                  sendMessage();
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
                  onClick={sendMessage}
                  disabled={!prompt.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
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
