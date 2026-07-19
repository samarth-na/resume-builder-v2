"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ResumeProject } from "@/lib/types";
import ChatPanel from "../../../components/workspace/ChatPanel";
import LatexEditor from "../../../components/workspace/LatexEditor";
import PdfPreview from "../../../components/workspace/PdfPreview";
import TopBar from "../../../components/workspace/TopBar";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ResumeProject | null>(null);
  const [view, setView] = useState<"preview" | "code">("preview");
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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 min-w-[420px] flex-col border-r border-border">
          <ChatPanel project={project} onUpdate={setProject} />
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
