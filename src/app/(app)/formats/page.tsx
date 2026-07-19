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
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-medium text-foreground">Formats</h1>
          <p className="text-xs text-muted-foreground">
            LaTeX templates that define how resumes are rendered.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New format
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {isAdding && (
            <div className="mb-6 rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-medium text-foreground">
                Create new format
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Format name"
                  className="rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring"
                />
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description"
                  className="rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring"
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addFormat}
                  className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Create format
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formats === null ? (
              <p className="col-span-full py-8 text-center text-[13px] text-muted-foreground">
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
