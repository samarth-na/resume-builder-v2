import type {
  AiMessage,
  ResumeEditInput,
  ResumeGenerationInput,
} from "@/lib/ai/types";

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const LATEX_ONLY_SYSTEM_PROMPT = `You are ResumeCraft, an expert resume writer and LaTeX specialist.

OUTPUT RULES:
- Output ONLY a complete LaTeX document wrapped in <latex>...</latex> tags.
- Do NOT output any explanation, commentary, or markdown outside the <latex> block.
- No prose before or after. No bullet points. No bold text. No commentary.

EXAMPLE OUTPUT:
<latex>
\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\begin{document}
\\section{Experience}
\\textbf{Senior Software Engineer} \\hfill 2022--Present \\\\
Acme Corp \\hfill San Francisco, CA \\\\
\\begin{itemize}
\\item Built distributed microservices handling 10M+ requests/day
\\end{itemize}
\\end{document}
</latex>

LATEX RULES:
- The content inside <latex> must be valid, compilable LaTeX.
- Start with \\documentclass and end with \\end{document}.
- Every LaTeX environment must be properly opened and closed.
- All special characters (%, $, &, _, #) must be escaped with a backslash.
- Use only standard LaTeX packages that are provided in the format template.
- DO NOT use \\input{glyphtounicode} or \\pdfglyphtounicode.
- If the user asks for changes, output the COMPLETE updated LaTeX inside <latex>, not just the changed sections.

CONTENT RULES:
- Fill every section with real data from the user's profile. Never use placeholder text.
- If a piece of information is missing from the profile, omit that element entirely.
- Tailor content to the target role and company when provided.
- Emphasize quantifiable achievements and relevant skills.
- Keep the resume to one page unless explicitly asked for more.

CHAT BEHAVIOR:
- The conversation may include multiple back-and-forth messages. Use the full chat history to understand what the user wants.
- When the user asks for edits, apply them to the existing LaTeX and return the complete updated document inside <latex>.
- When the user asks a question about the resume, still return the (unchanged or updated) LaTeX inside <latex>.`;

function buildFormatSection(formatLatex: string): string {
  if (!formatLatex.trim()) return "";
  return `\n\n--- FORMAT TEMPLATE (follow this structure and custom commands) ---\n${formatLatex}\n--- END FORMAT TEMPLATE ---`;
}

function buildMemorySection(profile: string): string {
  if (!profile.trim()) return "";
  return `\n\n--- USER PROFILE DATA (use this information to fill the resume) ---\n${profile}\n--- END USER PROFILE DATA ---`;
}

// ---------------------------------------------------------------------------
// Generation (first resume from profile)
// ---------------------------------------------------------------------------

export function buildGenerationMessages(
  input: ResumeGenerationInput,
  formatLatex?: string,
): AiMessage[] {
  const userParts = [
    "Generate a LaTeX resume using the following profile and context.",
    "",
    `Target role: ${input.targetRole}`,
    input.company ? `Target company: ${input.company}` : null,
    input.tone ? `Tone: ${input.tone}` : null,
    input.jobDescription ? `Job description:\n${input.jobDescription}` : null,
    input.extraInstructions
      ? `Additional instructions:\n${input.extraInstructions}`
      : null,
    buildFormatSection(formatLatex ?? ""),
    buildMemorySection(input.profile),
  ];

  return [
    { role: "system", content: LATEX_ONLY_SYSTEM_PROMPT },
    { role: "user", content: userParts.filter(Boolean).join("\n") },
  ];
}

// ---------------------------------------------------------------------------
// Edit (modify existing LaTeX)
// ---------------------------------------------------------------------------

export function buildEditMessages(
  input: ResumeEditInput,
  formatLatex?: string,
): AiMessage[] {
  const userParts = [
    "Edit the following LaTeX resume according to the user's instruction.",
    "",
    `Instruction: ${input.instruction}`,
    input.targetRole ? `Target role: ${input.targetRole}` : null,
    input.company ? `Target company: ${input.company}` : null,
    input.tone ? `Tone: ${input.tone}` : null,
    buildFormatSection(formatLatex ?? ""),
    buildMemorySection(input.profile),
    "",
    "Current LaTeX resume:",
    input.currentLatex,
  ];

  return [
    { role: "system", content: LATEX_ONLY_SYSTEM_PROMPT },
    { role: "user", content: userParts.filter(Boolean).join("\n") },
  ];
}

// ---------------------------------------------------------------------------
// Chat (multi-turn conversation with format + memory + history)
// ---------------------------------------------------------------------------

export function buildChatMessages(
  messages: AiMessage[],
  systemPrompt?: string,
  formatLatex?: string,
  profile?: string,
): AiMessage[] {
  const contextParts: string[] = [];

  if (formatLatex?.trim()) {
    contextParts.push(
      "FORMAT TEMPLATE (always follow this structure):",
      formatLatex.trim(),
    );
  }

  if (profile?.trim()) {
    contextParts.push(
      "",
      "USER PROFILE DATA (use this to fill resume content):",
      profile.trim(),
    );
  }

  const systemContent = [
    systemPrompt ?? LATEX_ONLY_SYSTEM_PROMPT,
    contextParts.length > 0 ? `\n\n${contextParts.join("\n")}` : "",
  ].join("");

  return [{ role: "system", content: systemContent }, ...messages];
}
