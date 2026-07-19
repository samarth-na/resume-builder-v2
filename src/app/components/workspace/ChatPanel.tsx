"use client";

import { ArrowUp, ChevronDown, FileUp, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ChatMessage, ResumeProject } from "@/lib/types";

type Props = {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
};

function extractLatex(text: string) {
  const tagMatch = text.match(/<latex>([\s\S]*?)<\/latex>/);
  return tagMatch ? tagMatch[1].trim() : null;
}

function AssistantMessage({
  thinking,
  content,
}: {
  thinking?: string;
  content: string;
}) {
  const latex = extractLatex(content);
  const explanation = content
    .replace(/<latex>[\s\S]*?<\/latex>/g, "")
    .replace(/```(?:latex|tex)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  return (
    <div className="max-w-[94%] text-[13px] leading-relaxed text-card-foreground">
      {thinking && (
        <p className="mb-3 whitespace-pre-wrap text-muted-foreground">
          {thinking}
        </p>
      )}
      {explanation && <p className="whitespace-pre-wrap">{explanation}</p>}
      {latex && !explanation && (
        <p className="text-muted-foreground">
          Resume generated. Edit it in the code view or ask for changes below.
        </p>
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
        content:
          content.replace(/<thinking>[\s\S]*?<\/thinking>\s*/g, "").trim() ||
          content.trim(),
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

    let assistantThinking = "";
    let assistantContent = "";
    const assistantId = crypto.randomUUID();
    const renderLive = (thinking: string, content: string) => {
      onUpdate({
        ...project,
        chat: [
          ...project.chat,
          userMessage,
          {
            id: assistantId,
            role: "assistant",
            content,
            timestamp: "Just now",
            thinking: thinking || undefined,
          },
        ],
        meta,
      });
    };
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || `Request failed (${response.status})`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let thinking = "";
      let content = "";
      renderLive("", "");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let event: {
            type?: string;
            text?: string;
            error?: string;
            thinking?: string;
            content?: string;
          };
          try {
            event = JSON.parse(trimmed);
          } catch {
            continue;
          }
          if (event.type === "thinking") {
            thinking += event.text ?? "";
            console.log(
              "[ChatPanel] Thinking event, total length:",
              thinking.length,
            );
            renderLive(thinking, content);
          } else if (event.type === "content") {
            content += event.text ?? "";
            renderLive(thinking, content);
          } else if (event.type === "error") {
            throw new Error(event.error || "Stream error");
          } else if (event.type === "done") {
            thinking = event.thinking ?? thinking;
            content = event.content ?? content;
          }
        }
      }
      assistantThinking = thinking;
      assistantContent = content || "No response received.";
    } catch (error) {
      assistantContent = `Something went wrong: ${error instanceof Error ? error.message : "Network error"}`;
    }

    const latex = extractLatex(assistantContent);
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: assistantContent,
      timestamp: "Just now",
      thinking: assistantThinking || undefined,
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
      body: JSON.stringify({
        role: "assistant",
        content: assistantContent,
        thinking: assistantThinking || undefined,
      }),
    });
    void fetch(`/api/workspaces/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latexCode: nextProject.latexCode, meta }),
    });
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl space-y-3">
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
                <AssistantMessage
                  thinking={
                    "thinking" in message
                      ? (message as ChatMessage & { thinking?: string })
                          .thinking
                      : undefined
                  }
                  content={message.content}
                />
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

      <div className="bg-background px-5 pb-4 pt-2">
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
            <div className="rounded-md bg-card p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-normal text-card-foreground">
                    Job brief
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Paste text or import a plain-text file.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded bg-secondary px-2 py-1 text-[10px] text-secondary-foreground hover:bg-accent">
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
                className="w-full resize-y rounded bg-background px-2.5 py-2 text-xs font-light leading-relaxed text-foreground placeholder:text-muted-foreground outline-none"
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
                  className="h-7 min-w-0 flex-1 rounded bg-background px-2 text-xs font-light text-foreground placeholder:text-muted-foreground outline-none"
                />
                {jobDescription && (
                  <span className="text-[10px] text-zinc-500">
                    {jobDescription.length.toLocaleString()} chars attached
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="rounded-md bg-card p-2.5">
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
                className="flex h-7 items-center gap-1.5 rounded bg-zinc-200 px-2.5 text-[11px] font-normal text-zinc-900 shadow-sm hover:bg-white disabled:opacity-40"
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
