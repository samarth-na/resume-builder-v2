import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import { createWorkspace, listWorkspaces } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const workspaces = await listWorkspaces(user.id);
  return jsonResponse(workspaces);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  let data: {
    name?: string;
    targetRole?: string;
    metaPrompt?: string;
    metaJobDescription?: string;
    metaCompany?: string;
    metaTone?: string;
  } = {};
  try {
    const body = await request.json();
    if (typeof body?.name === "string") data.name = body.name;
    if (typeof body?.targetRole === "string") data.targetRole = body.targetRole;
    if (typeof body?.meta?.prompt === "string")
      data.metaPrompt = body.meta.prompt;
    if (typeof body?.meta?.jobDescription === "string")
      data.metaJobDescription = body.meta.jobDescription;
    if (typeof body?.meta?.company === "string")
      data.metaCompany = body.meta.company;
    if (typeof body?.meta?.tone === "string") data.metaTone = body.meta.tone;
  } catch {
    data = {};
  }
  const workspace = await createWorkspace(user.id, data);
  return jsonResponse(workspace, 201);
}
