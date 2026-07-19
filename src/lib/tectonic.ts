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
    const error = typeof data.error === "string" ? data.error : undefined;
    const log = typeof data.log === "string" ? data.log : undefined;
    if (log) {
      const idx = log.indexOf("! ");
      const snippet =
        idx === -1
          ? log.trim().split("\n").slice(-30).join("\n")
          : log.slice(idx, idx + 1200);
      return `${error ?? "LaTeX compilation failed."}\n\n${snippet}`;
    }
    const detail =
      error ??
      (typeof data.message === "string" ? data.message : undefined) ??
      (typeof data.stderr === "string" ? data.stderr : undefined);
    if (typeof detail === "string") return detail;
  } catch {
    // The compiler may return its log as plain text.
  }
  return body;
}

function endpointCandidates(configuredEndpoint: string) {
  const endpoint = new URL(configuredEndpoint);
  if (endpoint.hostname === "localhost") endpoint.hostname = "127.0.0.1";

  const candidates = [endpoint.toString()];
  if (endpoint.pathname === "/" || endpoint.pathname === "") {
    endpoint.pathname = "/compile";
    candidates.push(endpoint.toString());
  }
  return candidates;
}

export async function compileLatex(latex: string): Promise<Uint8Array> {
  const configuredEndpoint = process.env.TECTONIC_API_URL;
  if (!configuredEndpoint) {
    throw new LatexCompilationError(
      "PDF rendering is not configured. Set TECTONIC_API_URL on the Next.js server.",
      503,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    let response: Response | undefined;
    let connectionError: unknown;
    const candidates = endpointCandidates(configuredEndpoint);

    for (const endpoint of candidates) {
      try {
        response = await fetch(endpoint, {
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
        if (response.status !== 404 && response.status !== 405) break;
      } catch (error) {
        connectionError = error;
      }
    }

    if (!response)
      throw connectionError ?? new Error("No compiler endpoint responded.");
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
