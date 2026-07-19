"use client";

import { Check, Copy, Download, FileCode2 } from "lucide-react";
import { useRef, useState } from "react";

const TOKEN_PATTERN = /(%[^\n]*|\\(?:[a-zA-Z@]+\*?|.)|[{}[\]]|\$\$?|&|~|\^)/g;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightLatex(code: string): string {
  let cursor = 0;
  let html = "";
  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    html += escapeHtml(code.slice(cursor, index));
    const token = match[0];
    const className = token.startsWith("%")
      ? "latex-comment"
      : token.startsWith("\\")
        ? "latex-command"
        : token === "{" || token === "}" || token === "[" || token === "]"
          ? "latex-brace"
          : token.startsWith("$")
            ? "latex-math"
            : "latex-operator";
    html += `<span class="${className}">${escapeHtml(token)}</span>`;
    cursor = index + token.length;
  }
  return `${html}${escapeHtml(code.slice(cursor))}\n`;
}

export default function LatexEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([value], { type: "application/x-tex" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resume.tex";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-900">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-3">
        <span className="flex items-center gap-2 font-mono text-[11px] font-light text-zinc-400">
          <FileCode2 className="h-3 w-3 text-zinc-400" />
          resume.tex
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Download className="h-3 w-3" /> Download
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden font-mono">
        <pre
          ref={preRef}
          className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-4 text-[12px] font-light leading-5 text-zinc-300"
          aria-hidden="true"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: every user-controlled token is HTML-escaped by highlightLatex
          dangerouslySetInnerHTML={{ __html: highlightLatex(value) }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          aria-label="LaTeX source editor"
          className="absolute inset-0 z-10 h-full w-full resize-none bg-transparent p-4 font-mono text-[12px] font-light leading-5 text-transparent caret-zinc-100 outline-none selection:bg-zinc-500/30"
        />
      </div>
    </div>
  );
}
