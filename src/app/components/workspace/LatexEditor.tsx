"use client";

import { Check, Copy, Download } from "lucide-react";
import { useRef, useState } from "react";

function highlightLatex(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\\[a-zA-Z]+)(\*?)/g, '<span class="latex-command">$1$2</span>')
    .replace(/(%.*$)/gm, '<span class="latex-comment">$1</span>')
    .replace(/(\{|\})/g, '<span class="latex-brace">$1</span>')
    .replace(/(\[|\])/g, '<span class="latex-brace">$1</span>')
    .replace(/("(?:\\.|[^"\\])*")/g, '<span class="latex-string">$1</span>')
    .replace(
      /\\begin\{([^}]+)\}/g,
      '\\begin{<span class="latex-arg">$1</span>}',
    )
    .replace(/\\end\{([^}]+)\}/g, '\\end{<span class="latex-arg">$1</span>}')
    .replace(/\\href\{([^}]+)\}/g, '\\href{<span class="latex-arg">$1</span>}')
    .replace(
      /\\documentclass(\[.*?\])?\{([^}]+)\}/g,
      '\\documentclass$1{<span class="latex-arg">$2</span>}',
    );
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
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <span className="text-xs font-medium text-zinc-400">resume.tex</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden font-mono text-sm">
        <pre
          ref={preRef}
          className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-4 text-sm leading-6 text-zinc-300"
          aria-hidden="true"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: local LaTeX syntax highlighter
          dangerouslySetInnerHTML={{ __html: highlightLatex(value) }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          className="absolute inset-0 z-10 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white outline-none"
        />
      </div>
    </div>
  );
}
