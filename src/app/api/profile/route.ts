import { errorResponse, jsonResponse } from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import { ensureProfile, upsertProfile } from "@/lib/db/queries";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const profile = await ensureProfile(user.id);
  return jsonResponse(profile);
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const body = (await request.json()) as Profile;
    if (!body || typeof body !== "object" || !body.basic) {
      return errorResponse("Invalid profile payload.", 400);
    }
    const profile = await upsertProfile(user.id, body);
    return jsonResponse(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}
