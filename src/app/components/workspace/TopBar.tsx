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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white hover:bg-zinc-900"
        >
          {name}
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
        <span className="text-xs text-zinc-600">|</span>
        <span className="text-xs text-zinc-500">{targetRole}</span>
        <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          {version}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
          <button
            type="button"
            onClick={() => onChangeView("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "preview"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onChangeView("code")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "code"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <History className="h-3.5 w-3.5" />
          History
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <Globe className="h-3.5 w-3.5" />
          Share
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
