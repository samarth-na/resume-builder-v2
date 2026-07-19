"use client";

import { Code2, Download, FileText, Monitor } from "lucide-react";

export default function TopBar({
  name,
  targetRole,
  version,
  view,
  latex,
  onChangeView,
}: {
  name: string;
  targetRole: string;
  version: string;
  view: "preview" | "code";
  latex: string;
  onChangeView: (view: "preview" | "code") => void;
}) {
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([latex], { type: "application/x-tex" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name.replace(/\s+/g, "-").toLowerCase() || "resume"}.tex`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background px-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-secondary text-zinc-400">
          <FileText className="h-3 w-3" strokeWidth={2.2} />
        </span>
        <span className="truncate text-xs font-normal text-foreground">
          {name}
        </span>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {targetRole}
        </span>
        <span className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground sm:inline">
          {version}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => onChangeView("preview")}
            className={`flex h-6 items-center gap-1.5 rounded-sm px-2 text-[10px] ${view === "preview" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Monitor className="h-3 w-3" strokeWidth={2} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onChangeView("code")}
            className={`flex h-6 items-center gap-1.5 rounded-sm px-2 text-[10px] ${view === "code" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Code2 className="h-3 w-3" strokeWidth={2} />
            Code
          </button>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={!latex.trim()}
          className="flex h-7 items-center gap-1.5 rounded border border-zinc-600 bg-zinc-700 px-2.5 text-[10px] text-zinc-100 shadow-sm hover:bg-zinc-600 disabled:opacity-40"
        >
          <Download className="h-3 w-3" strokeWidth={2.2} />
          Export .tex
        </button>
      </div>
    </header>
  );
}
