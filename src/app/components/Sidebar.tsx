"use client";

import {
  ChevronDown,
  FolderOpen,
  Gift,
  LayoutDashboard,
  Library,
  Plug,
  Search,
  Settings,
  Star,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initialProjects } from "@/lib/mock-data";

const topNav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profile", icon: UserCircle, label: "Profile" },
  { href: "#", icon: Search, label: "Search", shortcut: "Ctrl K" },
  { href: "#", icon: Library, label: "Resources" },
  { href: "#", icon: Plug, label: "Connectors" },
];

const projectFilters = [
  { href: "#", icon: FolderOpen, label: "All resumes" },
  { href: "#", icon: Star, label: "Starred" },
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

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
          R
        </div>
        <span className="flex-1 text-sm font-semibold text-white">
          ResumeCraft
        </span>
        <button
          type="button"
          className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <LayoutDashboard className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
            A
          </div>
          Alex's Workspace
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
            {initialProjects.slice(0, 3).map((project) => (
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

      <div className="border-t border-zinc-800 p-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Share ResumeCraft
            </p>
            <p className="text-xs text-zinc-500">100 credits per referral</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
          >
            <Gift className="h-4 w-4" />
          </button>
        </div>

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
              A
            </div>
            <span className="text-sm text-zinc-300">Alex Morgan</span>
          </div>
          <button
            type="button"
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
