"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileEntry, SectionType } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none`} />;
}

export default function EntryEditor({
  types,
  entry,
  onChange,
  onDelete,
}: {
  types: SectionType[];
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

  const hasTitleFields =
    types.includes("bullets") || types.includes("paragraph");

  return (
    <div className="rounded-md border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Entry
        </h4>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {hasTitleFields && (
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

      {types.includes("paragraph") && (
        <div className="mb-3">
          <TextArea
            rows={3}
            placeholder="Write a short paragraph..."
            value={entry.paragraph || ""}
            onChange={(e) => update("paragraph", e.target.value)}
          />
        </div>
      )}

      {types.includes("bullets") && (
        <>
          <div className="mb-3">
            <TextArea
              rows={2}
              placeholder="Summary / description (optional)"
              value={entry.paragraph || ""}
              onChange={(e) => update("paragraph", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {(entry.bullets || []).map((bullet, i) => (
              <div
                key={`${entry.id}-bullet-${i}`}
                className="flex items-center gap-2"
              >
                <span className="text-muted-foreground">•</span>
                <Input
                  placeholder="Bullet point"
                  value={bullet}
                  onChange={(e) => updateBullet(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeBullet(i)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBullet}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Add bullet
            </button>
          </div>
        </>
      )}

      {types.includes("tags") && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(entry.tags || []).map((tag, i) => (
              <div
                key={`${entry.id}-tag-${i}`}
                className="flex items-center gap-1"
              >
                <Input
                  placeholder="Skill"
                  value={tag}
                  onChange={(e) => updateTag(i, e.target.value)}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTag}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add tag
          </button>
        </div>
      )}
    </div>
  );
}
