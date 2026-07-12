"use client";

import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { initialProfile } from "@/lib/mock-data";
import type { ProfileSection, SectionType } from "@/lib/types";
import BasicInfoForm from "../components/profile/BasicInfoForm";
import SectionEditor from "../components/profile/SectionEditor";
import Sidebar from "../components/Sidebar";

const sectionTypeLabels: Record<SectionType, string> = {
  paragraph: "Paragraph",
  bullets: "Bullet points",
  tags: "Tag list",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState<SectionType>("bullets");
  const [saveStatus, setSaveStatus] = useState("Saved to workspace");

  const updateSection = (index: number, section: ProfileSection) => {
    const sections = [...profile.sections];
    sections[index] = section;
    setProfile({ ...profile, sections });
    setSaveStatus("Saving...");
    setTimeout(() => setSaveStatus("Saved to workspace"), 600);
  };

  const deleteSection = (index: number) => {
    const sections = [...profile.sections];
    sections.splice(index, 1);
    setProfile({ ...profile, sections });
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;
    const section: ProfileSection = {
      id: crypto.randomUUID(),
      name: newSectionName.trim(),
      type: newSectionType,
      entries: [],
    };
    setProfile({ ...profile, sections: [...profile.sections, section] });
    setNewSectionName("");
    setShowAddSection(false);
    setSaveStatus("Saving...");
    setTimeout(() => setSaveStatus("Saved to workspace"), 600);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
          <div>
            <h1 className="text-base font-semibold text-white">Profile</h1>
            <p className="text-xs text-zinc-500">
              The source data ResumeCraft uses to build your resumes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Save className="h-3.5 w-3.5" />
              {saveStatus}
            </span>
            <button
              type="button"
              onClick={() => {
                setSaveStatus("Saving...");
                setTimeout(() => setSaveStatus("Saved to workspace"), 600);
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Save changes
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl space-y-8">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                Basic information
              </h2>
              <BasicInfoForm
                value={profile.basic}
                onChange={(basic) => setProfile({ ...profile, basic })}
              />
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="mb-4 text-lg font-semibold text-zinc-100">Bio</h2>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Write a short professional bio..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
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

            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-5">
              {!showAddSection ? (
                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Add custom section
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Section name (e.g. Certificates)"
                      className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                    <select
                      value={newSectionType}
                      onChange={(e) =>
                        setNewSectionType(e.target.value as SectionType)
                      }
                      className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    >
                      {(Object.keys(sectionTypeLabels) as SectionType[]).map(
                        (type) => (
                          <option key={type} value={type}>
                            {sectionTypeLabels[type]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSection(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addSection}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
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
    </div>
  );
}
