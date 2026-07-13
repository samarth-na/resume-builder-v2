import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import { deleteFormat, getFormat, updateFormat } from "@/lib/db/queries";
import type { Format } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  const format = await getFormat(user.id, id);
  if (!format) return errorResponse("Format not found.", 404);
  return jsonResponse(format);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Partial<
      Pick<Format, "name" | "description" | "latexCode" | "isDefault">
    > = {};
    if (typeof body?.name === "string") data.name = body.name;
    if (typeof body?.description === "string")
      data.description = body.description;
    if (typeof body?.latexCode === "string") data.latexCode = body.latexCode;
    if (typeof body?.isDefault === "boolean") data.isDefault = body.isDefault;
    const format = await updateFormat(user.id, id, data);
    if (!format) return errorResponse("Format not found.", 404);
    return jsonResponse(format);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const { id } = await params;
  const ok = await deleteFormat(user.id, id);
  if (!ok) return errorResponse("Format not found.", 404);
  return jsonResponse({ ok: true });
}
