"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { ProfileSection, SectionType } from "@/lib/types";
import EntryEditor from "./EntryEditor";

const sectionTypeLabels: Record<SectionType, string> = {
  paragraph: "Paragraph",
  bullets: "Bullet points",
  tags: "Tag list",
};

export default function SectionEditor({
  section,
  onChange,
  onDelete,
}: {
  section: ProfileSection;
  onChange: (section: ProfileSection) => void;
  onDelete?: () => void;
}) {
  const [editingTypes, setEditingTypes] = useState(false);

  const addEntry = () => {
    const base = { id: crypto.randomUUID() };
    if (section.types.includes("tags"))
      onChange({
        ...section,
        entries: [...section.entries, { ...base, tags: [""] }],
      });
    else if (section.types.includes("paragraph"))
      onChange({
        ...section,
        entries: [...section.entries, { ...base, paragraph: "" }],
      });
    else
      onChange({
        ...section,
        entries: [...section.entries, { ...base, bullets: [""] }],
      });
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

  const toggleType = (type: SectionType) => {
    const next = section.types.includes(type)
      ? section.types.filter((t) => t !== type)
      : [...section.types, type];
    onChange({ ...section, types: next.length ? next : section.types });
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">
            {section.name}
          </h3>
          {editingTypes ? (
            <div className="flex items-center gap-2">
              {(Object.keys(sectionTypeLabels) as SectionType[]).map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={section.types.includes(type)}
                    onChange={() => toggleType(type)}
                    className="h-3 w-3 rounded border-zinc-600 bg-zinc-800 text-indigo-500"
                  />
                  {sectionTypeLabels[type]}
                </label>
              ))}
              <button
                type="button"
                onClick={() => setEditingTypes(false)}
                className="rounded p-0.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {section.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500"
                >
                  {sectionTypeLabels[type]}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setEditingTypes(true)}
                className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
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
            types={section.types}
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
