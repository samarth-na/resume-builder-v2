# API Demo — Resume Generation

This document shows how the frontend calls the AI resume API (two equivalent forms) and what it returns.

---

## Method 1: curl (matches the frontend fetch call)

```bash
#!/usr/bin/env bash

# 1. Sign in to get a session cookie
curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"password123"}'

# 2. Generate a resume (requires dev server running)
curl -s -b /tmp/cookies.txt -X POST http://localhost:3000/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Frontend Engineer",
    "company": "Stripe",
    "jobDescription": "Looking for a senior frontend engineer to own the design system and improve core web vitals.",
    "tone": "Professional",
    "prompt": "Generate a concise resume highlighting design system leadership and performance optimization."
  }'
```

### How the frontend does it (from ChatPanel.tsx)

```js
const res = await fetch("/api/resume/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    targetRole: "Senior Frontend Engineer",
    company: "Stripe",
    jobDescription: "...",
    tone: "Professional",
    prompt: "Generate a concise resume..."
  }),
});
const data = await res.json();
// data.latex contains the generated LaTeX
```

---

## Method 2: Internal script (no server needed)

Run with: `bun --env-file=.env.local run scripts/api-demo.ts`

This calls the same `ResumeAiClient` class the API routes use — no HTTP needed.

### Script: `scripts/api-demo.ts`

```typescript
#!/usr/bin/env bun
import { eq } from "drizzle-orm";
import { createResumeAiClient } from "@/lib/ai/client";
import { db } from "@/lib/db/index";
import { ensureDefaultFormat, getDefaultFormat, ensureProfile } from "@/lib/db/queries";
import { profileToString } from "@/lib/db/mappers";
import * as schema from "@/lib/db/schema";

// Loads profile from DB, calls the AI provider (NVIDIA via .env.local),
// and prints the generated LaTeX to stdout.
```

### Full output

**User context loaded:**
- User: `Alex Morgan` (mock profile for `demo@test.com`)
- Profile string: 1,780 chars (name, location, experience, education, skills)
- Format template: 7,859 chars (sb2nov Classic ATS-Friendly)

**AI call:**
- Provider: Nvidia (`minimaxai/minimax-m3`)
- Messages: system prompt (1,609 chars) + user request (10,212 chars)
- Tokens used: 3,035 prompt + 1,443 completion = 4,478 total

**Generated LaTeX (5,596 chars):**

```latex
\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}


\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

\begin{center}
    \textbf{\Huge \scshape Alex Morgan} \\ \vspace{1pt}
    \small +1 (555) 012-3456 $|$ \href{mailto:alex.morgan@example.com}{\underline{alex.morgan@example.com}} $|$
    \href{https://alexmorgan.dev}{\underline{alexmorgan.dev}} $|$
    \href{https://linkedin.com/in/alexmorgan}{\underline{linkedin.com/in/alexmorgan}}
\end{center}


%-----------SUMMARY-----------
\section{Summary}
\small{Product-minded full-stack engineer with a passion for building polished,
accessible web applications. Experienced in leading design systems and driving
performance at scale. Enjoy turning ambiguous requirements into delightful user
experiences and mentoring junior developers.}


%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart

    \resumeSubheading
      {Senior Frontend Engineer}{2022 -- Present}
      {Stripe}{San Francisco, USA}
      \resumeItemListStart
        \resumeItem{Lead the design system team, driving adoption across 40+ product squads and establishing governance for component standards.}
        \resumeItem{Shipped a new component library used by 200+ engineers, reducing UI inconsistency tickets by 60\%.}
        \resumeItem{Optimized core checkout flows, improving Lighthouse performance scores from 62 to 94 across key landing pages.}
        \resumeItem{Mentored 4 junior engineers through structured onboarding and weekly pair programming sessions.}
      \resumeItemListEnd

    \resumeSubheading
      {Full-Stack Developer}{2019 -- 2022}
      {Notion}{}
      \resumeItemListStart
        \resumeItem{Built features across the web and desktop clients for a productivity platform used by millions of users.}
        \resumeItem{Implemented real-time collaborative editing features using CRDTs and WebSockets.}
        \resumeItem{Reduced bundle size by 30\% through code splitting and lazy loading strategies.}
        \resumeItem{Collaborated with designers to ship accessibility improvements achieving WCAG 2.1 AA compliance.}
      \resumeItemListEnd

  \resumeSubHeadingListEnd


%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {University of California, Berkeley}{Berkeley, CA}
      {Bachelor of Science in Computer Science, GPA: 3.9/4.0}{2015 -- 2019}
      \resumeItemListStart
        \resumeItem{Graduated with honors. Focused on human-computer interaction and distributed systems.}
        \resumeItem{Teaching Assistant for CS 61A and CS 160.}
      \resumeItemListEnd
  \resumeSubHeadingListEnd


%-----------PROJECTS / ACHIEVEMENTS-----------
\section{Achievements}
    \resumeSubHeadingListStart
      \resumeProjectHeading
          {\textbf{Best Developer Experience Award} $|$ \emph{Stripe Internal Hackathon 2023}}{}
          \resumeItemListStart
            \resumeItem{Built a CLI tool that reduced local setup time from 2 hours to 12 minutes.}
          \resumeItemListEnd
      \resumeProjectHeading
          {\textbf{Open Source Maintainer} $|$ \emph{shadcn/ui}}{}
          \resumeItemListStart
            \resumeItem{Contributed 15+ accessible primitives used by 50k+ projects.}
          \resumeItemListEnd
    \resumeSubHeadingListEnd


%-----------TECHNICAL SKILLS-----------
\section{Technical Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
     \textbf{Languages}{: TypeScript, JavaScript, Rust, SQL (PostgreSQL)} \\
     \textbf{Frameworks}{: React, Next.js, Node.js, Tailwind CSS} \\
     \textbf{Tools}{: Git, Docker, GraphQL, Figma} \\
     \textbf{Specialties}{: Design Systems, Core Web Vitals, Accessibility (WCAG 2.1 AA), Performance Optimization}
    }}
 \end{itemize}


\end{document}
```

---

## How the pipeline works

```
User prompt  ──>  Dashboard / Workspace
                        │
                        ▼
           POST /api/resume/generate  (or /api/chat)
                        │
                        ▼
            ┌───────────────────────┐
            │   getProfileString()  │  ← loads from SQLite
            │   getDefaultFormat()  │  ← loads format template
            └───────┬───────────────┘
                    │
                    ▼
            ┌───────────────────────┐
            │  buildGenerationMessages() │
            │  "You are ResumeCraft..."  │
            │  + profile + format + prompt │
            └───────┬───────────────┘
                    │
                    ▼
            ┌───────────────────────┐
            │  NvidiaProvider /     │
            │  OpenAiProvider       │
            │  (configured in       │
            │   .env.local)         │
            └───────┬───────────────┘
                    │
                    ▼
            JSON response: { "latex": "\\documentclass{...}" }
                    │
                    ▼
            ChatPanel extracts LaTeX via regex
            Sets project.latexCode  →  LatexEditor on the right
            Auto-saves to DB via PUT /api/workspaces/[id]
```
