"use client";

import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Clock,
  FileCode2,
  FileText,
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
  const checks = [
    profile.basic.fullName,
    profile.basic.email,
    profile.basic.phone,
    profile.basic.city,
    profile.basic.country,
    profile.basic.linkedin,
    profile.basic.website,
    profile.bio,
  ];
  const filled = checks.filter((v) => v && v.trim().length > 0).length;
  const hasEntries = profile.sections.some((s) => s.entries.length > 0);
  return Math.round(
    ((filled + (hasEntries ? 1 : 0)) / (checks.length + 1)) * 100,
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded border border-border bg-secondary text-zinc-400">
          <Icon className="h-3 w-3" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-1 text-lg font-light tracking-tight text-card-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function DashboardV2() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [projects, setProjects] = useState<ResumeProject[] | null>(null);
  const [formats, setFormats] = useState<Format[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/workspaces")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ResumeProject[]) => {
        if (active) setProjects(data);
      })
      .catch(() => active && setProjects([]));
    fetch("/api/formats")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Format[]) => {
        if (active) setFormats(data);
      })
      .catch(() => active && setFormats([]));
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile | null) => {
        if (active) setProfile(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const createWorkspace = (targetRole?: string) => {
    const params = targetRole?.trim()
      ? `?role=${encodeURIComponent(targetRole.trim())}`
      : "";
    router.push(`/new-resume${params}`);
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const completion = profileCompletion(profile);
  const recents = projects?.slice(0, 5) ?? [];
  const lastUpdated = projects?.[0]?.updatedAt;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-medium text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
        <button
          type="button"
          onClick={() => createWorkspace()}
          className="flex h-7 items-center gap-1.5 rounded border border-zinc-300 bg-zinc-200 px-2.5 text-[11px] font-normal text-zinc-900 shadow-sm hover:bg-white"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New resume
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-5xl space-y-5">
          <div>
            <h2 className="text-base font-normal tracking-tight text-foreground">
              {greeting()}, {firstName}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Here&apos;s what&apos;s happening with your resumes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Resumes"
              value={projects === null ? "—" : String(projects.length)}
              hint={
                projects?.length === 0 ? "Create your first one" : undefined
              }
            />
            <StatCard
              icon={FileCode2}
              label="Formats"
              value={formats === null ? "—" : String(formats.length)}
              hint="LaTeX templates saved"
            />
            <StatCard
              icon={UserCircle}
              label="Profile completion"
              value={profile === null ? "—" : `${completion}%`}
              hint={
                completion < 100 ? "Fill it out for better output" : "All set"
              }
            />
            <StatCard
              icon={Clock}
              label="Last activity"
              value={lastUpdated ?? "—"}
              hint={lastUpdated ? "Most recent edit" : "No activity yet"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-[13px] font-medium text-foreground">
                  Recent resumes
                </h3>
                <Link
                  href="/resumes"
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                  <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                </Link>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {projects === null ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    Loading...
                  </p>
                ) : recents.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <p className="text-[13px] text-muted-foreground">
                      No resumes yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => createWorkspace()}
                      className="text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
                    >
                      Create your first resume
                    </button>
                  </div>
                ) : (
                  recents.map((project) => (
                    <Link
                      key={project.id}
                      href={`/workspace/${project.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-card-foreground">
                          {project.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {project.targetRole
                            ? `${project.targetRole} · ${project.updatedAt}`
                            : project.updatedAt}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
                        strokeWidth={1.75}
                      />
                    </Link>
                  ))
                )}
              </div>
            </section>

            <div className="space-y-4">
              <section className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" strokeWidth={1.75} />
                  <h3 className="text-[13px] font-medium text-card-foreground">
                    Generate with AI
                  </h3>
                </div>
                <div className="rounded-md border border-border bg-background p-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) createWorkspace(prompt);
                      }
                    }}
                    placeholder="A staff engineer resume for a fintech..."
                    className="h-16 w-full resize-none bg-transparent px-1.5 py-1 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => createWorkspace(prompt)}
                      disabled={!prompt.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    "Backend engineer",
                    "Product designer",
                    "Data scientist",
                  ].map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => createWorkspace(role)}
                      className="rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-input hover:bg-accent hover:text-accent-foreground"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[13px] font-medium text-card-foreground">
                    Profile snapshot
                  </h3>
                  <Link
                    href="/profile"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-500 bg-zinc-700 text-[11px] text-zinc-100">
                    {firstName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-card-foreground">
                      {profile?.basic.fullName || session?.user?.name || "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile?.basic.email || session?.user?.email || ""}
                    </p>
                  </div>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-zinc-500 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {completion}% complete — used as the source for every
                  generated resume.
                </p>
              </section>

              <section className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-[13px] font-medium text-card-foreground">
                  Quick actions
                </h3>
                <div className="space-y-px">
                  {[
                    {
                      href: "/resumes",
                      icon: FileText,
                      label: "Browse all resumes",
                    },
                    {
                      href: "/formats",
                      icon: FileCode2,
                      label: "Manage LaTeX formats",
                    },
                    {
                      href: "/profile",
                      icon: UserCircle,
                      label: "Update profile data",
                    },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href + label}
                      href={href}
                      className="group flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                        {label}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                        strokeWidth={1.75}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
