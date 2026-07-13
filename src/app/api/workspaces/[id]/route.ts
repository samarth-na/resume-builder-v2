import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  const workspace = await getWorkspace(user.id, id);
  if (!workspace) return errorResponse("Workspace not found.", 404);
  return jsonResponse(workspace);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, string> = {};
    if (typeof body?.name === "string") data.name = body.name;
    if (typeof body?.targetRole === "string") data.targetRole = body.targetRole;
    if (typeof body?.version === "string") data.version = body.version;
    if (typeof body?.latexCode === "string") data.latexCode = body.latexCode;
    if (body?.meta && typeof body.meta === "object") {
      const m = body.meta as Record<string, unknown>;
      if (typeof m.prompt === "string") data.metaPrompt = m.prompt;
      if (typeof m.jobDescription === "string")
        data.metaJobDescription = m.jobDescription;
      if (typeof m.company === "string") data.metaCompany = m.company;
      if (typeof m.tone === "string") data.metaTone = m.tone;
    }
    const workspace = await updateWorkspace(user.id, id, data);
    if (!workspace) return errorResponse("Workspace not found.", 404);
    return jsonResponse(workspace);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}
