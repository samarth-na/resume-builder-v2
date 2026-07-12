"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileEntry, SectionType } from "@/lib/types";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
    />
  );
}

export default function EntryEditor({
  type,
  entry,
  onChange,
  onDelete,
}: {
  type: SectionType;
  entry: ProfileEntry;
  onChange: (entry: ProfileEntry) => void;
  onDelete: () => void;
}) {
  const update = <K extends keyof ProfileEntry>(
    key: K,
    value: ProfileEntry[K],
  ) => {
    onChange({ ...entry, [key]: value });
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = [...(entry.bullets || [])];
    bullets[index] = value;
    update("bullets", bullets);
  };

  const addBullet = () => {
    update("bullets", [...(entry.bullets || []), ""]);
  };

  const removeBullet = (index: number) => {
    const bullets = [...(entry.bullets || [])];
    bullets.splice(index, 1);
    update("bullets", bullets);
  };

  const updateTag = (index: number, value: string) => {
    const tags = [...(entry.tags || [])];
    tags[index] = value;
    update("tags", tags);
  };

  const addTag = () => {
    update("tags", [...(entry.tags || []), ""]);
  };

  const removeTag = (index: number) => {
    const tags = [...(entry.tags || [])];
    tags.splice(index, 1);
    update("tags", tags);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Entry
        </h4>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {(type === "bullets" || type === "paragraph") && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Title / Degree / Role"
            value={entry.title || ""}
            onChange={(e) => update("title", e.target.value)}
          />
          <Input
            placeholder="Organization / Institution"
            value={entry.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
          />
          <Input
            placeholder="Date range"
            value={entry.dateRange || ""}
            onChange={(e) => update("dateRange", e.target.value)}
          />
        </div>
      )}

      {type === "paragraph" && (
        <TextArea
          rows={3}
          placeholder="Write a short paragraph..."
          value={entry.paragraph || ""}
          onChange={(e) => update("paragraph", e.target.value)}
        />
      )}

      {type === "bullets" && (
        <div className="space-y-2">
          {(entry.bullets || []).map((bullet, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-zinc-600">•</span>
              <Input
                placeholder="Bullet point"
                value={bullet}
                onChange={(e) => updateBullet(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeBullet(i)}
                className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBullet}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add bullet
          </button>
        </div>
      )}

      {type === "tags" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(entry.tags || []).map((tag, i) => (
              <div key={i} className="flex items-center gap-1">
                <Input
                  placeholder="Skill"
                  value={tag}
                  onChange={(e) => updateTag(i, e.target.value)}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTag}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add tag
          </button>
        </div>
      )}
    </div>
  );
}
