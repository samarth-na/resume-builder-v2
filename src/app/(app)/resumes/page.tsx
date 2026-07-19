"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ResumeProject } from "@/lib/types";
import ResumeCard from "../../components/ResumeCard";

export default function ResumesPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ResumeProject[] | null>(null);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ResumeProject[]) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const createWorkspace = async () => {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Untitled Resume" }),
    });
    if (!res.ok) return;
    const workspace: ResumeProject = await res.json();
    router.push(`/workspace/${workspace.id}`);
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
        <div>
          <h1 className="text-base font-semibold text-white">Resumes</h1>
          <p className="text-xs text-zinc-500">
            Every resume workspace you have created.
          </p>
        </div>
        <button
          type="button"
          onClick={createWorkspace}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-3.5 w-3.5" />
          New resume
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects === null ? (
              <p className="col-span-full py-8 text-center text-sm text-zinc-500">
                Loading resumes...
              </p>
            ) : projects.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-zinc-500">
                No resumes yet. Create one to get started.
              </p>
            ) : (
              projects.map((project) => (
                <ResumeCard key={project.id} project={project} />
              ))
            )}
            <button
              type="button"
              onClick={createWorkspace}
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
  );
}
