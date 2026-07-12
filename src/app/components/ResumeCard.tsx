"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import type { ResumeProject } from "@/lib/types";

export default function ResumeCard({ project }: { project: ResumeProject }) {
  return (
    <Link
      href={`/workspace/${project.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-80">
          <div className="h-2 w-1/3 rounded bg-zinc-800" />
          <div className="h-2 w-2/3 rounded bg-zinc-800" />
          <div className="mt-2 h-1.5 w-full rounded bg-zinc-800/60" />
          <div className="h-1.5 w-5/6 rounded bg-zinc-800/60" />
          <div className="h-1.5 w-4/6 rounded bg-zinc-800/60" />
          <div className="mt-3 h-1.5 w-full rounded bg-zinc-800/60" />
          <div className="h-1.5 w-3/4 rounded bg-zinc-800/60" />
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-zinc-900/90 p-2 text-zinc-400 backdrop-blur">
          <FileText className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
            {project.name}
          </h3>
          <p className="text-xs text-zinc-500">{project.updatedAt}</p>
        </div>
      </div>
    </Link>
  );
}
