"use client";

import { ArrowUp, ChevronDown, Mic, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ResumeProject } from "@/lib/types";

// Backup of the original hero-prompt dashboard (pre-/1 redesign).
// Not routed — kept for reference.
export default function DashboardHeroBackup() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const createWorkspace = async (targetRole?: string) => {
    const role = targetRole?.trim();
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: role ? `Resume — ${role}` : "Untitled Resume",
        targetRole: role || undefined,
      }),
    });
    if (!res.ok) return;
    const workspace: ResumeProject = await res.json();
    router.push(`/workspace/${workspace.id}`);
  };

  return (
    <main className="relative flex flex-1 flex-col overflow-y-auto bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,oklch(0.623_0.214_259.815_/_14%),transparent_70%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to build your next resume?
        </h1>

        <div className="w-full max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  createWorkspace(prompt.trim() || undefined);
                }
              }}
              placeholder="Ask ResumeCraft to generate a resume for..."
              className="h-24 w-full resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
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
                  onClick={() => createWorkspace(prompt.trim() || undefined)}
                  disabled={!prompt.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Tailor for a startup",
              "Make it more concise",
              "Highlight leadership",
              "Add a projects section",
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
    </main>
  );
}
