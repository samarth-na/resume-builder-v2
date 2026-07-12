"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileSection } from "@/lib/types";
import EntryEditor from "./EntryEditor";

export default function SectionEditor({
  section,
  onChange,
  onDelete,
}: {
  section: ProfileSection;
  onChange: (section: ProfileSection) => void;
  onDelete?: () => void;
}) {
  const addEntry = () => {
    const newEntry =
      section.type === "tags"
        ? { id: crypto.randomUUID(), tags: [""] }
        : section.type === "paragraph"
          ? { id: crypto.randomUUID(), paragraph: "" }
          : { id: crypto.randomUUID(), bullets: [""] };

    onChange({ ...section, entries: [...section.entries, newEntry] });
  };

  const updateEntry = (
    index: number,
    entry: ProfileSection["entries"][number],
  ) => {
    const entries = [...section.entries];
    entries[index] = entry;
    onChange({ ...section, entries });
  };

  const deleteEntry = (index: number) => {
    const entries = [...section.entries];
    entries.splice(index, 1);
    onChange({ ...section, entries });
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">
            {section.name}
          </h3>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {section.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add entry
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {section.entries.map((entry, index) => (
          <EntryEditor
            key={entry.id}
            type={section.type}
            entry={entry}
            onChange={(e) => updateEntry(index, e)}
            onDelete={() => deleteEntry(index)}
          />
        ))}
        {section.entries.length === 0 && (
          <p className="text-sm text-zinc-500">
            No entries yet. Click "Add entry" to start.
          </p>
        )}
      </div>
    </section>
  );
}
