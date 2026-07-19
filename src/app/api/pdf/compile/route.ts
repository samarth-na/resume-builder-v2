import { createAiProvider } from "@/lib/ai/factory";
import type { AiMessage } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth-server";
import { compileLatex, LatexCompilationError } from "@/lib/tectonic";

export const runtime = "nodejs";

const AI_FIX_TIMEOUT_MS = 15_000;

const FIX_LATEX_SYSTEM_PROMPT = `You are a LaTeX expert. Fix the following LaTeX code that failed to compile.

The Tectonic engine returned this error:
{error}

Rules:
- Return ONLY the corrected LaTeX document — no explanations, no markdown fences, no preamble.
- Start with \\documentclass and end with \\end{document}.
- Preserve the original structure and content; only fix syntax errors.
- Fix unmatched \\begin{}/\\end{}, unescaped special characters, missing braces, and package issues.
- DO NOT use \\input{glyphtounicode} or \\pdfglyphtounicode — the compiler does not provide that file. Remove those lines instead of fixing them.`;

async function tryFixLatex(
  brokenLatex: string,
  errorMessage: string,
): Promise<string | null> {
  try {
    const provider = createAiProvider();
    const messages: AiMessage[] = [
      {
        role: "system",
        content: FIX_LATEX_SYSTEM_PROMPT.replace("{error}", errorMessage),
      },
      { role: "user", content: brokenLatex },
    ];
    const result = await Promise.race([
      provider.complete(messages, { temperature: 0.1 }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("AI fix timed out")),
          AI_FIX_TIMEOUT_MS,
        ),
      ),
    ]);
    const fixed = result.content
      .replace(/<latex>([\s\S]*?)<\/latex>/, "$1")
      .replace(/```latex\s*/gi, "")
      .replace(/\s*```/g, "")
      .trim();
    if (!fixed.startsWith("\\documentclass")) return null;
    return fixed;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as { latex?: unknown };
    if (typeof body.latex !== "string" || !body.latex.trim()) {
      return Response.json(
        { error: "LaTeX source is required." },
        { status: 400 },
      );
    }
    if (body.latex.length > 1_000_000) {
      return Response.json(
        { error: "LaTeX source is too large to compile." },
        { status: 413 },
      );
    }

    try {
      const pdf = await compileLatex(body.latex);
      const responseBody = new Uint8Array(pdf).buffer;
      return new Response(responseBody, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="resume.pdf"',
          "Cache-Control": "no-store",
        },
      });
    } catch (compileError) {
      if (
        !(compileError instanceof LatexCompilationError) ||
        compileError.status !== 422
      ) {
        throw compileError;
      }

      const errorMessage = compileError.message;
      const fixedLatex = await tryFixLatex(body.latex, errorMessage);
      if (!fixedLatex) throw compileError;

      // Hand the fixed LaTeX back to the client so it can show the
      // faulty → AI-fix → recompile cycle and re-POST the corrected source.
      return Response.json(
        { status: "fixed", originalError: errorMessage, fixedLatex },
        { status: 207 },
      );
    }
  } catch (error) {
    const status = error instanceof LatexCompilationError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "PDF compilation failed.";
    return Response.json({ error: message }, { status });
  }
}
