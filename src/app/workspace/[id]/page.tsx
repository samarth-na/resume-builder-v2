"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { initialProjects } from "@/lib/mock-data";
import type { ResumeProject } from "@/lib/types";
import Sidebar from "../../components/Sidebar";
import ChatPanel from "../../components/workspace/ChatPanel";
import LatexEditor from "../../components/workspace/LatexEditor";
import PdfPreview from "../../components/workspace/PdfPreview";
import TopBar from "../../components/workspace/TopBar";

function findProject(id: string): ResumeProject {
  return (
    initialProjects.find((p) => p.id === id) || {
      ...initialProjects[0],
      id,
      name: "Untitled Resume",
    }
  );
}

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState(() => findProject(params.id));
  const [view, setView] = useState<"preview" | "code">("preview");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
        <TopBar
          name={project.name}
          targetRole={project.targetRole}
          version={project.version}
          view={view}
          onChangeView={setView}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-1/2 min-w-[420px] flex-col border-r border-zinc-800">
            <ChatPanel project={project} onUpdate={setProject} />
          </div>

          <div className="flex flex-1 flex-col">
            {view === "preview" ? (
              <PdfPreview latexCode={project.latexCode} />
            ) : (
              <LatexEditor
                value={project.latexCode}
                onChange={(latexCode) => setProject({ ...project, latexCode })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
