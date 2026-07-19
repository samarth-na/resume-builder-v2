"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { ResumeProject } from "@/lib/types";

export default function ResumeCard({ project }: { project: ResumeProject }) {
  return (
    <Link
      href={`/workspace/${project.id}`}
      className="group flex items-center gap-3 rounded-md border border-border bg-card p-3 hover:border-input hover:bg-accent/30"
    >
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-border bg-background">
        <div className="absolute inset-0 flex flex-col gap-1 p-2 opacity-80">
          <div className="h-1.5 w-1/3 rounded bg-muted" />
          <div className="h-1.5 w-2/3 rounded bg-muted" />
          <div className="mt-1 h-1 w-full rounded bg-muted/70" />
          <div className="h-1 w-5/6 rounded bg-muted/70" />
          <div className="h-1 w-4/6 rounded bg-muted/70" />
        </div>
        <div className="absolute bottom-1 right-1 rounded border border-border bg-card p-1 text-muted-foreground">
          <FileText className="h-3 w-3" strokeWidth={2.2} />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-xs font-normal text-card-foreground">
          {project.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {project.updatedAt}
        </p>
      </div>
    </Link>
  );
}
