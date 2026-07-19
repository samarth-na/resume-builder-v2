import { getSessionUser } from "@/lib/auth-server";
import { compileLatex, LatexCompilationError } from "@/lib/tectonic";

export const runtime = "nodejs";

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

    const pdf = await compileLatex(body.latex);
    const responseBody = new Uint8Array(pdf).buffer;
    return new Response(responseBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = error instanceof LatexCompilationError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "PDF compilation failed.";
    return Response.json({ error: message }, { status });
  }
}
