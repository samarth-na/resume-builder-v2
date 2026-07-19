"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileCode2,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Format, Profile, ResumeProject } from "@/lib/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function profileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  const fields = [
    profile.basic.fullName,
    profile.basic.email,
    profile.basic.phone,
    profile.basic.city,
    profile.basic.country,
    profile.basic.linkedin,
    profile.basic.website,
    profile.bio,
  ];
  const filled = fields.filter((value) => value?.trim()).length;
  const hasEntries = profile.sections.some((section) => section.entries.length);
  return Math.round(((filled + (hasEntries ? 1 : 0)) / 9) * 100);
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [projects, setProjects] = useState<ResumeProject[] | null>(null);
  const [formats, setFormats] = useState<Format[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [instructions, setInstructions] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const suggestedRole = new URLSearchParams(window.location.search).get(
      "role",
    );
    if (suggestedRole) setTargetRole(suggestedRole);
    let active = true;
    Promise.all([
      fetch("/api/workspaces").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/formats").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/profile").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([workspaceData, formatData, profileData]) => {
        if (!active) return;
        setProjects(workspaceData);
        setFormats(formatData);
        setProfile(profileData);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
        setFormats([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const createWorkspace = async (withJobDescription = true) => {
    if (creating || (withJobDescription && !jobDescription.trim())) return;
    setCreating(true);
    const role = targetRole.trim();
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: role ? `Resume — ${role}` : "Untitled Resume",
        targetRole: role || undefined,
        meta: {
          prompt: instructions.trim(),
          jobDescription: withJobDescription ? jobDescription.trim() : "",
          company: company.trim(),
          tone: "Professional",
        },
      }),
    });
    if (res.ok) {
      const workspace: ResumeProject = await res.json();
      router.push(`/workspace/${workspace.id}`);
      return;
    }
    setCreating(false);
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const completion = profileCompletion(profile);
  const recents = projects?.slice(0, 5) ?? [];
  const metrics = [
    {
      label: "Resumes",
      value: projects === null ? "—" : projects.length,
      icon: FileText,
    },
    {
      label: "Formats",
      value: formats === null ? "—" : formats.length,
      icon: FileCode2,
    },
    {
      label: "Profile",
      value: profile === null ? "—" : `${completion}%`,
      icon: UserCircle,
    },
    {
      label: "Last activity",
      value: projects?.[0]?.updatedAt ?? "None yet",
      icon: Clock,
    },
  ];

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-medium text-foreground">Dashboard</h1>
        <button
          type="button"
          onClick={() => void createWorkspace(false)}
          className="flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Blank resume
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {greeting()}, {firstName}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Paste a job description and build a resume tailored to the role.
            </p>
          </div>

          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/15 text-brand">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-[13px] font-medium text-card-foreground">
                  Generate a tailored resume
                </h3>
                <p className="text-xs text-muted-foreground">
                  The job description is the primary source for keyword and
                  experience matching.
                </p>
              </div>
            </div>
            <div className="p-4">
              <label
                htmlFor="job-description"
                className="mb-2 block text-[13px] font-medium text-card-foreground"
              >
                Job description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={8}
                placeholder="Paste the full job description here…"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>
                  {jobDescription.trim()
                    ? "Job context ready"
                    : "Required for tailored generation"}
                </span>
                <span>{jobDescription.length.toLocaleString()} characters</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Target role"
                  className="h-9 rounded-md border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Company (optional)"
                  className="h-9 rounded-md border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
              </div>
              <input
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Additional instructions, e.g. emphasize platform leadership (optional)"
                className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />

              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => void createWorkspace(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Start without a job description
                </button>
                <button
                  type="button"
                  disabled={!jobDescription.trim() || creating}
                  onClick={() => void createWorkspace(true)}
                  className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate tailored resume
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-4 lg:divide-y-0">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <Icon
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="truncate text-[13px] font-medium text-card-foreground">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-[13px] font-medium text-foreground">
                Recent resumes
              </h3>
              <Link
                href="/resumes"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {projects === null ? (
                <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                  Loading…
                </p>
              ) : recents.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                  Your generated resumes will appear here.
                </p>
              ) : (
                recents.map((project) => (
                  <Link
                    key={project.id}
                    href={`/workspace/${project.id}`}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-accent"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-card-foreground">
                        {project.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.targetRole || "Untargeted resume"} ·{" "}
                        {project.updatedAt}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
