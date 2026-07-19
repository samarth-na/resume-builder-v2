"use client";

import { ArrowLeft, Download, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Format } from "@/lib/types";
import FormatPdfPreview from "../../../components/formats/FormatPdfPreview";
import LatexEditor from "../../../components/workspace/LatexEditor";

export default function FormatDetailPage() {
  const params = useParams<{ id: string }>();
  const [format, setFormat] = useState<Format | null>(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/formats/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Format | null) => setFormat(data));
  }, [params.id]);

  const persistLatex = (latexCode: string) => {
    setSaveStatus("Saving...");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/formats/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexCode }),
      });
      setSaveStatus(res.ok ? "Saved" : "Save failed");
    }, 800);
  };

  const downloadTex = () => {
    if (!format) return;
    const blob = new Blob([format.latexCode], { type: "application/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${format.name.replace(/\s+/g, "-").toLowerCase()}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!format) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Loading format...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/formats"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Formats
          </Link>
          <span className="text-xs text-zinc-600">|</span>
          <h1 className="text-sm font-semibold text-white">{format.name}</h1>
          {format.isDefault && (
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-300">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Save className="h-3.5 w-3.5" />
            {saveStatus}
          </span>
          <button
            type="button"
            onClick={downloadTex}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download .tex
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 min-w-[420px] flex-col border-r border-zinc-800">
          <LatexEditor
            value={format.latexCode}
            onChange={(latexCode) => {
              setFormat({ ...format, latexCode });
              persistLatex(latexCode);
            }}
          />
        </div>

        <div className="flex flex-1 flex-col">
          <FormatPdfPreview formatName={format.name} />
        </div>
      </div>
    </div>
  );
}
