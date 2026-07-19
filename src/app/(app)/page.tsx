"use client";

import { ArrowUp, ChevronDown, Mic, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ResumeProject } from "@/lib/types";

export default function Dashboard() {
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
    <main className="relative flex flex-1 flex-col overflow-y-auto bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-purple-900/20 to-zinc-950" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to build your next resume?
        </h1>

        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur">
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
              className="h-24 w-full resize-none bg-transparent px-3 py-2 text-base text-zinc-100 placeholder-zinc-500 outline-none"
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
                  onClick={() => createWorkspace(prompt.trim() || undefined)}
                  disabled={!prompt.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
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
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
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
