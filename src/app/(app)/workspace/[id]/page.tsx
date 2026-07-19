"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeProject } from "@/lib/types";
import ChatPanel from "../../../components/workspace/ChatPanel";
import LatexEditor from "../../../components/workspace/LatexEditor";
import PdfPreview from "../../../components/workspace/PdfPreview";
import TopBar from "../../../components/workspace/TopBar";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ResumeProject | null>(null);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [chatWidth, setChatWidth] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/workspaces/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ResumeProject | null) => setProject(data));
  }, [params.id]);

  const persistLatex = (latexCode: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch(`/api/workspaces/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexCode }),
      });
    }, 800);
  };

  const startDrag = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      setChatWidth(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <TopBar
        name={project.name}
        targetRole={project.targetRole}
        version={project.version}
        view={view}
        latex={project.latexCode}
        onChangeView={setView}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div
          className="flex min-w-[420px] flex-col"
          style={{ width: `${chatWidth}%` }}
        >
          <ChatPanel project={project} onUpdate={setProject} />
        </div>

        <div
          onMouseDown={startDrag}
          className={`group relative w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-brand ${
            dragging ? "bg-brand" : ""
          }`}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        <div className="flex flex-1 flex-col">
          {view === "preview" ? (
            <PdfPreview latex={project.latexCode} />
          ) : (
            <LatexEditor
              value={project.latexCode}
              onChange={(latexCode) => {
                setProject({ ...project, latexCode });
                persistLatex(latexCode);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
