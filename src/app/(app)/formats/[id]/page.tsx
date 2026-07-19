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
      <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        Loading format...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/formats"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Formats
          </Link>
          <span className="text-xs text-muted-foreground/40">/</span>
          <h1 className="truncate text-[13px] font-medium text-foreground">
            {format.name}
          </h1>
          {format.isDefault && (
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            {saveStatus}
          </span>
          <button
            type="button"
            onClick={downloadTex}
            className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            Download .tex
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 min-w-[420px] flex-col border-r border-border">
          <LatexEditor
            value={format.latexCode}
            onChange={(latexCode) => {
              setFormat({ ...format, latexCode });
              persistLatex(latexCode);
            }}
          />
        </div>

        <div className="flex flex-1 flex-col">
          <FormatPdfPreview latex={format.latexCode} />
        </div>
      </div>
    </div>
  );
}
