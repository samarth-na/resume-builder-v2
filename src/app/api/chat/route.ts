import { createResumeAiClient } from "@/lib/ai/client";
import { errorResponse } from "@/lib/ai/http";
import type { AiMessage } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth-server";
import {
  ensureDefaultFormat,
  getDefaultFormat,
  getFormat,
  getProfileStringForUser,
} from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("[/api/chat] Received request");
  const user = await getSessionUser();
  if (!user) {
    console.log("[/api/chat] No session user, returning 401");
    return errorResponse("Unauthorized", 401);
  }
  console.log("[/api/chat] Authenticated user:", user.id, user.email);

  try {
    const body = await request.json();
    const messages = body.messages as AiMessage[] | undefined;
    const systemPrompt =
      typeof body.systemPrompt === "string" ? body.systemPrompt : undefined;

    console.log("[/api/chat] Request body:", {
      messageCount: messages?.length ?? 0,
      messages: messages?.map((m: AiMessage) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.substring(0, 80),
      })),
      hasSystemPrompt: !!systemPrompt,
    });

    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse("messages must be a non-empty array.", 400);
    }

    const cleanMessages = messages.filter(
      (m) =>
        typeof m?.role === "string" &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0 &&
        ["system", "user", "assistant"].includes(m.role),
    );

    if (cleanMessages.length === 0) {
      return errorResponse("messages must be a non-empty array.", 400);
    }
    messages.length = 0;
    messages.push(...cleanMessages);

    // Resolve format template (by ID or inline LaTeX, fallback to default)
    let formatLatex =
      typeof body.formatLatex === "string" ? body.formatLatex : undefined;
    const formatId =
      typeof body.formatId === "string" ? body.formatId : undefined;
    if (!formatLatex && formatId) {
      const fmt = await getFormat(user.id, formatId);
      if (fmt) formatLatex = fmt.latexCode;
    }
    if (!formatLatex) {
      await ensureDefaultFormat(user.id);
      const defaultFmt = await getDefaultFormat(user.id);
      if (defaultFmt) {
        formatLatex = defaultFmt.latexCode;
        console.log("[/api/chat] Default format loaded:", defaultFmt.name);
      }
    }

    // Resolve profile (from DB or inline)
    const profile =
      typeof body.profile === "string" && body.profile.trim()
        ? body.profile
        : await getProfileStringForUser(user.id);

    console.log("[/api/chat] Resolved context:", {
      formatLatexLength: formatLatex?.length ?? 0,
      profileLength: profile?.length ?? 0,
    });

    const client = createResumeAiClient();

    console.log("[/api/chat] Starting streamed AI call...");
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let thinking = "";
        let content = "";
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
        try {
          for await (const event of client.streamChat({
            messages,
            systemPrompt,
            formatLatex,
            profile,
          })) {
            if (event.type === "thinking") {
              thinking += event.text;
              send({ type: "thinking", text: event.text });
            } else if (event.type === "content") {
              content += event.text;
              send({ type: "content", text: event.text });
            }
          }
          send({ type: "done", thinking, content });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.";
          console.error("[/api/chat] Stream error:", message);
          send({ type: "error", error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("[/api/chat] Route error:", message);
    return errorResponse(message, 500);
  }
}
