"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { Format } from "@/lib/types";
import FormatCard from "../../components/FormatCard";

export default function FormatsPage() {
  const [formats, setFormats] = useState<Format[] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetch("/api/formats")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Format[]) => setFormats(data))
      .catch(() => setFormats([]));
  }, []);

  const addFormat = async () => {
    const name = newName.trim();
    if (!name) return;
    const res = await fetch("/api/formats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: newDescription.trim() || "Custom resume format",
        latexCode:
          "\\documentclass[11pt,a4paper]{article}\n\n\\begin{document}\n% Your format here\n\n\\end{document}\n",
      }),
    });
    if (!res.ok) return;
    const format: Format = await res.json();
    setFormats((prev) => [...(prev ?? []), format]);
    setNewName("");
    setNewDescription("");
    setIsAdding(false);
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
        <div>
          <h1 className="text-base font-semibold text-white">Formats</h1>
          <p className="text-xs text-zinc-500">
            LaTeX templates that define how resumes are rendered.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-3.5 w-3.5" />
          New format
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {isAdding && (
            <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">
                Create new format
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Format name"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addFormat}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  Create format
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formats === null ? (
              <p className="col-span-full py-8 text-center text-sm text-zinc-500">
                Loading formats...
              </p>
            ) : (
              formats.map((format) => (
                <FormatCard key={format.id} format={format} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
