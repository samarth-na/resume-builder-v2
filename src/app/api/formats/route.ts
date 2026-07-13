import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import {
  createFormat,
  ensureDefaultFormat,
  listFormats,
} from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  await ensureDefaultFormat(user.id);
  const formats = await listFormats(user.id);
  return jsonResponse(formats);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) return errorResponse("name is required.", 400);
    const format = await createFormat(user.id, {
      name,
      description:
        typeof body?.description === "string" ? body.description : "",
      latexCode: typeof body?.latexCode === "string" ? body.latexCode : "",
    });
    return jsonResponse(format, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}
