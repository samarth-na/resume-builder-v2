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
    <section className="border-t border-border py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-foreground">
            {section.name}
          </h3>
          {editingTypes ? (
            <div className="flex items-center gap-1.5">
              {(Object.keys(sectionTypeLabels) as SectionType[]).map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={section.types.includes(type)}
                    onChange={() => toggleType(type)}
                    className="h-3 w-3 rounded-sm border-input bg-background accent-brand"
                  />
                  {sectionTypeLabels[type]}
                </label>
              ))}
              <button
                type="button"
                onClick={() => setEditingTypes(false)}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {section.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {sectionTypeLabels[type]}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setEditingTypes(true)}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addEntry}
            className="flex h-7 items-center gap-1.5 rounded-md bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add entry
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
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
          <p className="py-3 text-[13px] text-muted-foreground">
            No entries yet. Click &quot;Add entry&quot; to start.
          </p>
        )}
      </div>
    </section>
  );
}
