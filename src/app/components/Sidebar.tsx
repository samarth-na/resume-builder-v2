"use client";

import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileCode2,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  SquarePen,
  Sun,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme";
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
  active,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group flex h-8 items-center rounded-md text-[13px] font-light transition-colors ${collapsed ? "justify-center px-1" : "gap-2 px-2"} ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${active ? "bg-brand/25 text-sidebar-accent-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"}`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.4 : 2} />
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { theme, toggleTheme } = useTheme();
  const [recents, setRecents] = useState<ResumeProject[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("sidebar-collapsed") === "true");
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

  const toggle = () => {
    setCollapsed((current) => {
      window.localStorage.setItem("sidebar-collapsed", String(!current));
      return !current;
    });
  };
  const signOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };
  const userName = session?.user?.name ?? "Guest";
  const initials = userName.slice(0, 1).toUpperCase();
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href) ||
        (href === "/resumes" && pathname.startsWith("/workspace"));

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${collapsed ? "w-14" : "w-60"}`}
    >
      <div
        className={`flex h-12 items-center ${collapsed ? "justify-center px-2" : "gap-1 px-3"}`}
      >
        {!collapsed && (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 hover:bg-sidebar-accent/60"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-normal text-primary-foreground">
              R
            </div>
            <span className="truncate text-[13px] font-light text-sidebar-foreground">
              {userName}&apos;s workspace
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>
        )}
        {!collapsed && (
          <button
            type="button"
            title="Search"
            className="rounded-md border border-transparent p-1.5 text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
          className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-1.5 text-muted-foreground shadow-sm hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
          )}
        </button>
      </div>

      <nav
        className={`flex-1 space-y-5 overflow-y-auto pb-4 ${collapsed ? "px-2" : "px-3"}`}
      >
        <div className="space-y-0.5">
          {topNav.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              collapsed={collapsed}
              active={isActive(item.href)}
            />
          ))}
        </div>
        {!collapsed && (
          <div>
            <h3 className="mb-1 px-2 text-[11px] font-light text-muted-foreground">
              Recents
            </h3>
            <div className="space-y-0.5">
              {recents.length === 0 && (
                <p className="px-2 py-1 text-xs font-light text-muted-foreground/60">
                  No resumes yet.
                </p>
              )}
              {recents.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.id}`}
                  className="group flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-light text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sidebar-accent/60 text-muted-foreground group-hover:text-sidebar-foreground">
                    <FileText className="h-3 w-3" strokeWidth={2.2} />
                  </span>
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div
        className={`border-t border-sidebar-border p-2 ${collapsed ? "flex flex-col items-center gap-1" : ""}`}
      >
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={() => router.push("/")}
              title="New resume"
              className="rounded-md border border-transparent p-2 text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <SquarePen className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              className="rounded-md border border-transparent p-2 text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={2.2} />
              )}
            </button>
            <div
              title={userName}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] text-primary-foreground"
            >
              {initials}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between rounded-md px-1.5 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-normal text-primary-foreground">
                {initials}
              </div>
              <span className="truncate text-[13px] font-light text-sidebar-foreground">
                {userName}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to light" : "Switch to dark"}
                className="rounded-md border border-transparent p-1.5 text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Moon className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="rounded-md border border-transparent p-1.5 text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
