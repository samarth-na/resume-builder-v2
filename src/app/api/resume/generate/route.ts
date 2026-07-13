import { createResumeAiClient } from "@/lib/ai/client";
import {
  errorResponse,
  jsonResponse,
  validateOptionalString,
} from "@/lib/ai/http";
import { getSessionUser } from "@/lib/auth-server";
import {
  ensureDefaultFormat,
  getDefaultFormat,
  getFormat,
  getProfileStringForUser,
} from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const body = await request.json();
    const targetRole =
      typeof body?.targetRole === "string" ? body.targetRole.trim() : "";
    if (!targetRole) return errorResponse("targetRole is required.", 400);

    const company = validateOptionalString(body.company);
    const jobDescription = validateOptionalString(body.jobDescription);
    const tone = validateOptionalString(body.tone);
    const extraInstructions = validateOptionalString(body.extraInstructions);
    const profile = await getProfileStringForUser(
      user.id,
      validateOptionalString(body.profile),
    );

    // Resolve format template (by ID or inline LaTeX, fallback to default)
    let formatLatex = validateOptionalString(body.formatLatex);
    const formatId = validateOptionalString(body.formatId);
    if (!formatLatex && formatId) {
      const fmt = await getFormat(user.id, formatId);
      if (fmt) formatLatex = fmt.latexCode;
    }
    if (!formatLatex) {
      await ensureDefaultFormat(user.id);
      const defaultFmt = await getDefaultFormat(user.id);
      if (defaultFmt) formatLatex = defaultFmt.latexCode;
    }

    const client = createResumeAiClient();
    const result = await client.generateResume(
      {
        profile,
        targetRole,
        company,
        jobDescription,
        tone,
        extraInstructions,
        formatLatex,
      },
      undefined,
    );

    return jsonResponse({ latex: result.content, usage: result.usage });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return errorResponse(message, 500);
  }
}
