const DEFAULT_TIMEOUT_MS = 30_000;

export class LatexCompilationError extends Error {
  constructor(
    message: string,
    readonly status = 422,
  ) {
    super(message);
    this.name = "LatexCompilationError";
  }
}

function decodeBase64(value: string) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}

async function readError(response: Response) {
  const body = await response.text();
  if (!body) return `Tectonic returned ${response.status}.`;
  try {
    const data = JSON.parse(body) as Record<string, unknown>;
    const detail = data.error ?? data.message ?? data.log ?? data.stderr;
    if (typeof detail === "string") return detail;
  } catch {
    // The compiler may return its log as plain text.
  }
  return body;
}

export async function compileLatex(latex: string): Promise<Uint8Array> {
  const endpoint = process.env.TECTONIC_API_URL;
  if (!endpoint) {
    throw new LatexCompilationError(
      "PDF rendering is not configured. Set TECTONIC_API_URL on the Next.js server.",
      503,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf, application/json",
        ...(process.env.TECTONIC_API_KEY
          ? { Authorization: `Bearer ${process.env.TECTONIC_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ latex }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LatexCompilationError(await readError(response), 422);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/pdf")) {
      return new Uint8Array(await response.arrayBuffer());
    }

    const data = (await response.json()) as Record<string, unknown>;
    const encoded = data.pdf ?? data.pdfBase64 ?? data.data;
    if (typeof encoded === "string") {
      return decodeBase64(
        encoded.replace(/^data:application\/pdf;base64,/, ""),
      );
    }
    if (typeof data.url === "string") {
      const pdfResponse = await fetch(data.url, {
        headers: process.env.TECTONIC_API_KEY
          ? { Authorization: `Bearer ${process.env.TECTONIC_API_KEY}` }
          : {},
        cache: "no-store",
        signal: controller.signal,
      });
      if (!pdfResponse.ok) {
        throw new LatexCompilationError(
          "The generated PDF could not be downloaded.",
          502,
        );
      }
      return new Uint8Array(await pdfResponse.arrayBuffer());
    }

    throw new LatexCompilationError(
      "Tectonic returned an unsupported response. Expected PDF bytes or JSON with pdf/pdfBase64/url.",
      502,
    );
  } catch (error) {
    if (error instanceof LatexCompilationError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LatexCompilationError(
        "PDF compilation timed out after 30 seconds.",
        504,
      );
    }
    throw new LatexCompilationError(
      error instanceof Error
        ? error.message
        : "Could not reach the PDF compiler.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
