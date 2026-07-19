"use client";

import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "resume-pdf:";

export default function PdfPreview({ latex }: { latex: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [originalError, setOriginalError] = useState<string | null>(null);
  const workspaceId = useRef<string | null>(null);

  const requestRef = useRef<AbortController | null>(null);

  const persistPdf = useCallback(async (blob: Blob) => {
    const id = workspaceId.current;
    if (!id) return;
    try {
      const buffer = await blob.arrayBuffer();
      const chunkSize = 1024 * 512;
      const total = Math.ceil(buffer.byteLength / chunkSize);
      const meta = JSON.stringify({ total });
      window.localStorage.setItem(`${STORAGE_PREFIX}${id}:meta`, meta);
      for (let i = 0; i < total; i++) {
        const slice = buffer.slice(i * chunkSize, (i + 1) * chunkSize);
        const b64 = btoa(String.fromCharCode(...new Uint8Array(slice)));
        window.localStorage.setItem(`${STORAGE_PREFIX}${id}:${i}`, b64);
      }
    } catch {
      // Storage may be full or unavailable — ignore, preview still works in-memory.
    }
  }, []);

  const restorePdf = useCallback((id: string): string | null => {
    try {
      const metaRaw = window.localStorage.getItem(
        `${STORAGE_PREFIX}${id}:meta`,
      );
      if (!metaRaw) return null;
      const { total } = JSON.parse(metaRaw) as { total: number };
      let binary = "";
      for (let i = 0; i < total; i++) {
        const chunk = window.localStorage.getItem(
          `${STORAGE_PREFIX}${id}:${i}`,
        );
        if (!chunk) return null;
        binary += atob(chunk);
      }
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return URL.createObjectURL(
        new Blob([bytes], { type: "application/pdf" }),
      );
    } catch {
      return null;
    }
  }, []);

  const compile = useCallback(
    async (sourceLatex?: string) => {
      requestRef.current?.abort();
      const source = sourceLatex ?? latex;
      if (!source.trim()) {
        setPdfUrl(null);
        setError(null);
        return;
      }

      const controller = new AbortController();
      requestRef.current = controller;
      setCompiling(true);
      setError(null);
      setFixing(false);
      setOriginalError(null);
      try {
        const response = await fetch("/api/pdf/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latex: source }),
          signal: controller.signal,
        });

        if (response.status === 207) {
          const data = (await response.json()) as {
            status?: string;
            originalError?: string;
            fixedLatex?: string;
          };
          if (data.status === "fixed" && data.fixedLatex) {
            setFixing(true);
            setOriginalError(data.originalError ?? null);
            // Resend the AI-corrected LaTeX for a fresh compile.
            await compile(data.fixedLatex);
            return;
          }
          throw new Error(data.originalError || "Compilation failed.");
        }

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            data?.error || `Compilation failed (${response.status}).`,
          );
        }
        const blob = await response.blob();
        const nextUrl = URL.createObjectURL(blob);
        setPdfUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return nextUrl;
        });
        void persistPdf(blob);
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(
          cause instanceof Error ? cause.message : "PDF compilation failed.",
        );
      } finally {
        if (requestRef.current === controller) {
          setCompiling(false);
          setFixing(false);
        }
      }
    },
    [latex, persistPdf],
  );

  useEffect(() => {
    const id = (window.location.pathname.match(/\/workspace\/(.+)$/)?.[1] ??
      "") as string;
    workspaceId.current = id;
    const restored = restorePdf(id);
    if (restored) setPdfUrl(restored);
  }, [restorePdf]);

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
          {fixing
            ? "Optimizing your resume…"
            : compiling
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
        {fixing && !pdfUrl && (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Optimizing your resume for the best layout, then recompiling…
          </div>
        )}
        {compiling && !fixing && !pdfUrl && (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Building your preview…
          </div>
        )}
        {error && (
          <div className="absolute inset-x-3 top-3 z-10 mx-auto max-w-2xl rounded-md border border-zinc-600 bg-zinc-900/95 p-3 text-zinc-200 shadow-xl">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Tectonic could not compile this LaTeX
                </p>
                {originalError && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    We tried to optimize the resume but it still failed to
                    compile. Original error:
                  </p>
                )}
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-zinc-700 bg-zinc-950 p-2.5 text-[11px] leading-relaxed text-zinc-300">
                  {error}
                </pre>
                <button
                  type="button"
                  onClick={() => void compile()}
                  className="mt-2 flex items-center gap-1.5 rounded border border-zinc-600 bg-zinc-700 px-2.5 py-1.5 text-[11px] font-normal text-zinc-100 hover:bg-zinc-600"
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
