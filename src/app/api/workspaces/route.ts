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
  let data: { name?: string; targetRole?: string } = {};
  try {
    const body = await request.json();
    if (typeof body?.name === "string") data.name = body.name;
    if (typeof body?.targetRole === "string") data.targetRole = body.targetRole;
  } catch {
    data = {};
  }
  const workspace = await createWorkspace(user.id, data);
  return jsonResponse(workspace, 201);
}
