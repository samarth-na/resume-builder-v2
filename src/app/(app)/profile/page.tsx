"use client";

import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { Profile, ProfileSection, SectionType } from "@/lib/types";
import BasicInfoForm from "../../components/profile/BasicInfoForm";
import SectionEditor from "../../components/profile/SectionEditor";

const sectionTypeLabels: Record<SectionType, string> = {
  paragraph: "Paragraph",
  bullets: "Bullet points",
  tags: "Tag list",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionTypes, setNewSectionTypes] = useState<SectionType[]>([
    "bullets",
  ]);
  const [saveStatus, setSaveStatus] = useState("Saved");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data: Profile) => setProfile(data))
      .catch(() => setSaveStatus("Failed to load profile"));
  }, []);

  const persist = async (next: Profile) => {
    setSaveStatus("Saving...");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      setSaveStatus("Save failed");
      return;
    }
    const saved: Profile = await res.json();
    setProfile(saved);
    setSaveStatus("Saved");
  };

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        Loading profile...
      </main>
    );
  }

  const updateSection = (index: number, section: ProfileSection) => {
    const sections = [...profile.sections];
    sections[index] = section;
    const next = { ...profile, sections };
    setProfile(next);
    void persist(next);
  };

  const deleteSection = (index: number) => {
    const sections = [...profile.sections];
    sections.splice(index, 1);
    const next = { ...profile, sections };
    setProfile(next);
    void persist(next);
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;
    const section: ProfileSection = {
      id: crypto.randomUUID(),
      name: newSectionName.trim(),
      types: newSectionTypes,
      entries: [],
    };
    const next = { ...profile, sections: [...profile.sections, section] };
    setProfile(next);
    setNewSectionName("");
    setNewSectionTypes(["bullets"]);
    setShowAddSection(false);
    void persist(next);
  };

  const toggleType = (type: SectionType) => {
    setNewSectionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-medium text-foreground">Profile</h1>
          <p className="text-xs text-muted-foreground">
            The source data ResumeCraft uses to build your resumes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            {saveStatus}
          </span>
          <button
            type="button"
            onClick={() => void persist(profile)}
            className="flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Save changes
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <section className="pb-8">
            <h2 className="mb-4 text-sm font-medium text-foreground">
              Basic information
            </h2>
            <BasicInfoForm
              value={profile.basic}
              onChange={(basic) => {
                const next = { ...profile, basic };
                setProfile(next);
              }}
              onBlur={() => void persist(profile)}
            />
          </section>

          <section className="border-t border-border py-8">
            <h2 className="mb-1 text-sm font-medium text-foreground">
              Professional summary
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              A reusable overview the AI can adapt for each role.
            </p>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              onBlur={() => void persist(profile)}
              placeholder="Write a short professional bio..."
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring"
            />
          </section>

          {profile.sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              onChange={(s) => updateSection(index, s)}
              onDelete={
                section.isDefault ? undefined : () => deleteSection(index)
              }
            />
          ))}

          <div className="border-t border-border py-8">
            {!showAddSection ? (
              <button
                type="button"
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Add custom section
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Section name (e.g. Certificates)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring"
                />
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(sectionTypeLabels) as SectionType[]).map(
                    (type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-card-foreground transition-colors has-checked:border-brand has-checked:bg-brand/10"
                      >
                        <input
                          type="checkbox"
                          checked={newSectionTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="h-3.5 w-3.5 rounded-sm border-input bg-background accent-brand"
                        />
                        {sectionTypeLabels[type]}
                      </label>
                    ),
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSection}
                    className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Create section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
