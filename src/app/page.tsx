"use client";

import {
  ArrowUp,
  ChevronDown,
  FileText,
  Mic,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { initialProjects } from "@/lib/mock-data";
import ResumeCard from "./components/ResumeCard";
import Sidebar from "./components/Sidebar";

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="relative flex flex-1 flex-col overflow-y-auto bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-purple-900/20 to-zinc-950" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
          <Link
            href="#"
            className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur transition-colors hover:border-zinc-700 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Connect all your tools
            <span className="text-zinc-500">→</span>
          </Link>

          <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to build your next resume?
          </h1>

          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-zinc-200 transition-colors hover:bg-zinc-600"
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

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white"
                >
                  <FileText className="h-3.5 w-3.5" />
                  My resumes
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300"
                >
                  Recently viewed
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300"
                >
                  Templates
                </button>
              </div>
              <Link
                href="#"
                className="text-xs font-medium text-zinc-400 hover:text-white"
              >
                Browse all →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {initialProjects.map((project) => (
                <ResumeCard key={project.id} project={project} />
              ))}
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-4 text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">New resume</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
