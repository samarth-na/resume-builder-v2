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
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-medium text-foreground">Resumes</h1>
          <p className="text-xs text-muted-foreground">
            Every resume workspace you have created.
          </p>
        </div>
        <button
          type="button"
          onClick={createWorkspace}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New resume
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {projects === null ? (
              <p className="col-span-full py-8 text-center text-[13px] text-muted-foreground">
                Loading resumes...
              </p>
            ) : projects.length === 0 ? (
              <p className="col-span-full py-8 text-center text-[13px] text-muted-foreground">
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
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/30 p-4 text-muted-foreground transition-colors hover:border-input hover:bg-card/60 hover:text-foreground"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-[13px] font-medium">New resume</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
