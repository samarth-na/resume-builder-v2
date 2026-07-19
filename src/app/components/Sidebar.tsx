"use client";

import {
  ChevronDown,
  FileCode2,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  SquarePen,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { ResumeProject } from "@/lib/types";

const topNav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/resumes", icon: FileText, label: "Resumes" },
  { href: "/profile", icon: UserCircle, label: "Profile" },
  { href: "/formats", icon: FileCode2, label: "Formats" },
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
      className={`group flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[13px] transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        {label}
      </span>
      {shortcut && (
        <kbd className="hidden rounded border border-sidebar-border bg-sidebar px-1 py-px text-[10px] font-medium text-muted-foreground lg:block">
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
        if (active) setRecents(data.slice(0, 5));
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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (pathname.startsWith(href)) return true;
    // Resume workspaces belong to the Resumes section.
    return href === "/resumes" && pathname.startsWith("/workspace");
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-12 items-center gap-1 px-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-sidebar-accent/60"
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-semibold text-background">
            R
          </div>
          <span className="truncate text-[13px] font-medium text-sidebar-foreground">
            {userName}&apos;s workspace
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
        <button
          type="button"
          title="Search"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          title="New resume"
          onClick={() => router.push("/")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <SquarePen className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <div className="space-y-px">
          {topNav.map((item) => (
            <NavItem key={item.label} {...item} active={isActive(item.href)} />
          ))}
        </div>

        <div>
          <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">
            Recents
          </h3>
          <div className="space-y-px">
            {recents.length === 0 && (
              <p className="px-2 py-1 text-[13px] text-muted-foreground/60">
                No resumes yet.
              </p>
            )}
            {recents.map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${project.id}`}
                className="flex h-7 items-center gap-2 rounded-md px-2 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              >
                <FileText
                  className="h-4 w-4 shrink-0 text-muted-foreground/70"
                  strokeWidth={1.75}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center justify-between rounded-md px-1.5 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">
              {initials}
            </div>
            <span className="truncate text-[13px] text-sidebar-foreground">
              {userName}
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
