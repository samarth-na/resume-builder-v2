"use client";

import {
  ChevronDown,
  Code2,
  Download,
  Globe,
  History,
  Monitor,
  MoreHorizontal,
} from "lucide-react";

export default function TopBar({
  name,
  targetRole,
  version,
  view,
  onChangeView,
}: {
  name: string;
  targetRole: string;
  version: string;
  view: "preview" | "code";
  onChangeView: (view: "preview" | "code") => void;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
        >
          <span className="truncate">{name}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
        <span className="hidden text-xs text-muted-foreground/60 sm:inline">
          /
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          {targetRole}
        </span>
        <span className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          {version}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => onChangeView("preview")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "preview"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" strokeWidth={1.75} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onChangeView("code")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "code"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Code
          </button>
        </div>

        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <History className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden lg:inline">History</span>
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden lg:inline">Share</span>
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Export
        </button>
        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
