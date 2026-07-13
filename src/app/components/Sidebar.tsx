"use client";

import {
  ChevronDown,
  FileCode2,
  FolderOpen,
  LayoutDashboard,
  Library,
  LogOut,
  Plug,
  Search,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { ResumeProject } from "@/lib/types";

const topNav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profile", icon: UserCircle, label: "Profile" },
  { href: "/formats", icon: FileCode2, label: "Formats" },
  { href: "#", icon: Search, label: "Search", shortcut: "Ctrl K" },
  { href: "#", icon: Library, label: "Resources" },
  { href: "#", icon: Plug, label: "Connectors" },
];

const projectFilters = [
  { href: "#", icon: FolderOpen, label: "All resumes" },
  { href: "#", icon: UserCircle, label: "Created by me" },
  { href: "#", icon: Users, label: "Shared with me" },
];

function NavItem({
  href,
  icon: Icon,
  label,
  shortcut,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-zinc-800/80 text-white"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {shortcut && (
        <kbd className="hidden rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 group-hover:text-zinc-400 lg:block">
          {shortcut}
        </kbd>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [recents, setRecents] = useState<ResumeProject[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/workspaces")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ResumeProject[]) => {
        if (active) setRecents(data.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const userName = session?.user?.name ?? "Guest";
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
          R
        </div>
        <span className="flex-1 text-sm font-semibold text-white">
          ResumeCraft
        </span>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
            {initials}
          </div>
          {userName}'s Workspace
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-zinc-500" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        <div className="space-y-0.5">
          {topNav.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </div>

        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Resumes
          </h3>
          <div className="space-y-0.5">
            {projectFilters.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Recents
          </h3>
          <div className="space-y-0.5">
            {recents.length === 0 && (
              <p className="px-3 text-xs text-zinc-600">No resumes yet.</p>
            )}
            {recents.map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${project.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                <div className="h-5 w-5 rounded bg-zinc-800" />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="space-y-2 border-t border-zinc-800 p-3">
        <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
          <div>
            <p className="text-sm font-medium text-zinc-200">Upgrade to Pro</p>
            <p className="text-xs text-zinc-500">Unlock more templates</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-indigo-600/20 p-2 text-indigo-400 hover:bg-indigo-600/30"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {initials}
            </div>
            <span className="truncate text-sm text-zinc-300">{userName}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
