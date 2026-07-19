"use client";

import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PdfPreview({ latex }: { latex: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);

  const requestRef = useRef<AbortController | null>(null);

  const compile = useCallback(async () => {
    requestRef.current?.abort();
    if (!latex.trim()) {
      setPdfUrl(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setCompiling(true);
    setError(null);
    try {
      const response = await fetch("/api/pdf/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || `Compilation failed (${response.status}).`,
        );
      }
      const nextUrl = URL.createObjectURL(await response.blob());
      setPdfUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextUrl;
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setError(
        cause instanceof Error ? cause.message : "PDF compilation failed.",
      );
    } finally {
      if (requestRef.current === controller) setCompiling(false);
    }
  }, [latex]);

  useEffect(() => {
    const timer = window.setTimeout(() => void compile(), 700);
    return () => window.clearTimeout(timer);
  }, [compile]);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  if (!latex.trim()) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-800 p-6">
        <div className="max-w-sm text-center text-zinc-300">
          <FileText className="mx-auto mb-2 h-7 w-7 text-zinc-500" />
          <p className="text-[13px] font-normal">Your PDF will appear here</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Generate a resume or add LaTeX source to start.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-zinc-800">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900/45 px-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          {compiling ? (
            <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />
          ) : (
            <FileText className="h-3 w-3 text-zinc-400" />
          )}
          {compiling
            ? "Compiling with Tectonic…"
            : error
              ? "Compilation failed"
              : "Live PDF preview"}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void compile()}
            disabled={compiling}
            className="rounded border border-transparent p-1 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Recompile PDF"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {pdfUrl && !error && (
            <a
              href={pdfUrl}
              download="resume.pdf"
              className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 items-start justify-center overflow-hidden p-3">
        {pdfUrl && (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            title="Compiled resume PDF"
            className="h-full w-full max-w-[900px] rounded border border-zinc-600 bg-white shadow-xl"
          />
        )}
        {compiling && !pdfUrl && (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Building your preview…
          </div>
        )}
        {error && (
          <div className="absolute inset-x-5 top-5 z-10 mx-auto max-w-2xl rounded-xl border border-rose-300/25 bg-rose-950/90 p-4 text-rose-50 shadow-xl backdrop-blur">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Tectonic could not compile this LaTeX
                </p>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-950/55 p-3 text-xs leading-relaxed text-rose-100">
                  {error}
                </pre>
                <button
                  type="button"
                  onClick={() => void compile()}
                  className="mt-3 flex items-center gap-1.5 rounded-md bg-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-950 hover:bg-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
