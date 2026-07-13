import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import { createMessage, getWorkspace, listMessages } from "@/lib/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  const workspace = await getWorkspace(user.id, id);
  if (!workspace) return errorResponse("Workspace not found.", 404);
  const messages = await listMessages(id);
  return jsonResponse(messages);
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  const workspace = await getWorkspace(user.id, id);
  if (!workspace) return errorResponse("Workspace not found.", 404);
  try {
    const body = await request.json();
    const role = body?.role;
    const content = typeof body?.content === "string" ? body.content : "";
    if (
      !["system", "user", "assistant"].includes(role) ||
      content.trim().length === 0
    ) {
      return errorResponse("role and content are required.", 400);
    }
    const message = await createMessage(id, role, content);
    return jsonResponse(message, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}
