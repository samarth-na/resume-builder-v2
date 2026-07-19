"use client";

import {
  ArrowUp,
  BrainCircuit,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { ChatMessage, ResumeProject } from "@/lib/types";

type Props = {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
};

function extractLatex(text: string) {
  return text.match(/\\documentclass[\s\S]*\\end\{document\}/)?.[0] ?? null;
}

function splitThinking(content: string) {
  const match = content.match(/<resume-thinking>([\s\S]*?)<\/resume-thinking>/);
  return {
    thinking: match?.[1].trim() ?? "",
    content: content.replace(
      /<resume-thinking>[\s\S]*?<\/resume-thinking>\s*/,
      "",
    ),
  };
}

function AssistantMessage({ content }: { content: string }) {
  const parts = splitThinking(content);
  const latex = extractLatex(parts.content);
  const explanation = parts.content
    .replace(/```(?:latex|tex)?\s*/gi, "")
    .replace(/```/g, "")
    .replace(/\\documentclass[\s\S]*\\end\{document\}/, "")
    .trim();
  const [copied, setCopied] = useState(false);

  return (
    <div className="max-w-[94%] text-[13px] leading-relaxed text-card-foreground">
      {parts.thinking && (
        <details className="mb-3 overflow-hidden rounded border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-[11px] font-normal text-zinc-300 hover:bg-accent">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700">
              <BrainCircuit className="h-3 w-3" />
            </span>
            How I approached this
            <ChevronDown className="ml-auto h-3.5 w-3.5" />
          </summary>
          <div className="whitespace-pre-wrap border-t border-border px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {parts.thinking}
          </div>
        </details>
      )}
      {explanation && <p className="whitespace-pre-wrap">{explanation}</p>}
      {latex && (
        <details className="mt-3 overflow-hidden rounded-md border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium hover:bg-accent">
            <span className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-brand" />
              Generated LaTeX{" "}
              <span className="font-normal text-muted-foreground">
                {latex.split("\n").length} lines
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </summary>
          <div className="border-t border-border">
            <div className="flex items-center justify-between bg-background px-3 py-2 text-xs text-muted-foreground">
              <span>Complete generated source</span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(latex);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-accent hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre p-3 text-xs leading-relaxed text-muted-foreground">
              <code>{latex}</code>
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

export default function ChatPanel({ project, onUpdate }: Props) {
  const [prompt, setPrompt] = useState(project.meta.prompt);
  const [jobDescription, setJobDescription] = useState(
    project.meta.jobDescription,
  );
  const [company, setCompany] = useState(project.meta.company);
  const [showContext, setShowContext] = useState(!project.latexCode);
  const [sending, setSending] = useState(false);
  const isFirstGeneration = !project.latexCode.trim();

  const sendMessage = async () => {
    const instruction =
      prompt.trim() ||
      (isFirstGeneration && jobDescription.trim()
        ? "Generate a tailored resume for this job description."
        : "");
    if (!instruction || sending) return;
    const meta = {
      ...project.meta,
      prompt: instruction,
      jobDescription,
      company,
    };
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: instruction,
      timestamp: "Just now",
    };
    const context = isFirstGeneration
      ? `Generate a complete LaTeX resume. Target role: ${project.targetRole || "Not specified"}. Target company: ${company || "Not specified"}. Job description:\n${jobDescription || "Not supplied"}`
      : `Edit the current resume. Current LaTeX:\n${project.latexCode}`;
    const messages = [
      ...project.chat.map(({ role, content }) => ({
        role,
        content: splitThinking(content).content,
      })),
      { role: "user" as const, content: context },
      { role: "user" as const, content: instruction },
    ];

    onUpdate({ ...project, chat: [...project.chat, userMessage], meta });
    setPrompt("");
    setSending(true);
    void fetch(`/api/workspaces/${project.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: instruction }),
    });

    let assistantContent = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      assistantContent = response.ok
        ? `${data.thinking ? `<resume-thinking>\n${data.thinking}\n</resume-thinking>\n` : ""}${data.content || "No response received."}`
        : `Something went wrong: ${data.error || `Request failed (${response.status})`}`;
    } catch (error) {
      assistantContent = `Something went wrong: ${error instanceof Error ? error.message : "Network error"}`;
    }

    const latex = extractLatex(assistantContent);
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent,
      timestamp: "Just now",
    };
    const nextProject = {
      ...project,
      chat: [...project.chat, userMessage, assistantMessage],
      meta,
      latexCode: latex || project.latexCode,
    };
    onUpdate(nextProject);
    void fetch(`/api/workspaces/${project.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "assistant", content: assistantContent }),
    });
    void fetch(`/api/workspaces/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latexCode: nextProject.latexCode, meta }),
    });
    setSending(false);
    setShowContext(false);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl space-y-5">
          {project.chat.length === 0 && (
            <div className="text-[13px] leading-relaxed text-muted-foreground">
              {jobDescription
                ? "Your job description is ready. Generate the first tailored draft below."
                : "Add a job description to generate a tailored resume, or start with your own instructions."}
            </div>
          )}
          {project.chat.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <AssistantMessage content={message.content} />
              ) : (
                <p className="max-w-[88%] whitespace-pre-wrap rounded-lg bg-secondary px-3.5 py-2.5 text-[13px] leading-relaxed text-secondary-foreground">
                  {message.content}
                </p>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isFirstGeneration
                ? "Tailoring your resume…"
                : "Applying your changes…"}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-xl space-y-3">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="flex w-full items-center justify-between rounded-md px-1 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span className="truncate">
                {project.targetRole || "Target role"}
                {company ? ` · ${company}` : ""} ·{" "}
                {jobDescription
                  ? `${jobDescription.length.toLocaleString()} character JD`
                  : "No job description"}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showContext ? "rotate-180" : ""}`}
            />
          </button>
          {showContext && (
            <div className="rounded-md border border-border bg-card p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-normal text-card-foreground">
                    Job brief
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Paste text or import a plain-text file.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded border border-border bg-secondary px-2 py-1 text-[10px] text-secondary-foreground hover:bg-accent">
                  <FileUp className="h-3 w-3" /> Import
                  <input
                    type="file"
                    accept=".txt,.md,text/plain,text/markdown"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void file.text().then(setJobDescription);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              <textarea
                id="workspace-jd"
                rows={4}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the role responsibilities and requirements…"
                className="w-full resize-y rounded border border-input bg-background px-2.5 py-2 text-xs font-light leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:border-zinc-500"
              />
              <div className="mt-2 flex items-center gap-2">
                <label
                  htmlFor="workspace-company"
                  className="text-[10px] text-muted-foreground"
                >
                  Company
                </label>
                <input
                  id="workspace-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Optional"
                  className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-2 text-xs font-light text-foreground placeholder:text-muted-foreground outline-none focus:border-zinc-500"
                />
                {jobDescription && (
                  <span className="text-[10px] text-zinc-500">
                    {jobDescription.length.toLocaleString()} chars attached
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="rounded-md border border-input bg-card p-2.5 focus-within:border-zinc-500">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={
                isFirstGeneration
                  ? "Add tailoring instructions (optional)…"
                  : "Ask for a change to this resume…"
              }
              className="h-12 w-full resize-none bg-transparent text-xs font-light text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={
                  sending ||
                  (!prompt.trim() &&
                    !(isFirstGeneration && jobDescription.trim()))
                }
                className="flex h-7 items-center gap-1.5 rounded border border-zinc-300 bg-zinc-200 px-2.5 text-[11px] font-normal text-zinc-900 shadow-sm hover:bg-white disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFirstGeneration ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
                {isFirstGeneration ? "Generate resume" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
