# ResumeCraft — Overview

_Last updated: July 2026_

## What it is

ResumeCraft is a **Lovable-style interactive resume builder** — a chat-driven workflow that generates, previews, and iterates on LaTeX resumes. The UI is backed by a Drizzle/SQLite database, Better Auth for email/password sessions, and real AI backend routes.

## Aim

To provide a polished, opinionated interface for:

- **Managing source data** — a profile hub where users store personal info, bios, work experience, education, skills, and custom sections (persisted in DB).
- **Generating resumes via chat** — a conversational workspace where users describe the role or tone they want and receive a LaTeX draft (via AI providers).
- **Iterating through chat + code** — a split-pane workspace with a chat panel on one side and a preview/code toggle on the other, letting users refine both content and LaTeX source.
- **Previewing output** — a live PDF preview compiled by an external Tectonic service through an authenticated server-side proxy.
- **Managing formats** — a library of LaTeX templates that can be selected and edited, then used as the basis for resume generation (persisted in DB).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.10 |
| UI Library | React 19.2.4 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Linting / Formatting | Biome 2.2.0 |
| Package manager | Bun |
| Auth | Better Auth (email/password, drizzle-adapter) |
| Database | Drizzle ORM + SQLite via `@libsql/client` |
| AI backend | OpenAI / Nvidia providers via `src/lib/ai/` |

## App structure

```
src/
├── app/
│   ├── layout.tsx            — Root layout (font loading, globals)
│   ├── globals.css           — Tailwind v4 config + theme tokens
│   ├── sign-in/
│   │   └── page.tsx          — Email/password sign-in
│   ├── sign-up/
│   │   └── page.tsx          — Email/password sign-up
│   ├── (app)/                — Route group for authenticated pages
│   │   ├── layout.tsx        — Shared shell (Sidebar + flex container)
│   │   ├── page.tsx          — Dashboard (generation prompt hero)
│   │   ├── resumes/
│   │   │   └── page.tsx      — Resume list (all workspaces)
│   │   ├── profile/
│   │   │   └── page.tsx      — Source-data hub (basic info, bio, sections)
│   │   ├── formats/
│   │   │   ├── page.tsx      — Format/template library
│   │   │   └── [id]/
│   │   │       └── page.tsx  — Format editor (LaTeX + live PDF preview)
│   │   └── workspace/
│   │       └── [id]/
│   │           └── page.tsx  — Resume workspace (chat + preview/code)
│   └── components/
│       ├── Sidebar.tsx       — Persistent nav sidebar (session-aware)
│       ├── ResumeCard.tsx    — Resume project card
│       ├── FormatCard.tsx    — Format card (formats list)
│       ├── profile/
│       │   ├── BasicInfoForm.tsx
│       │   ├── SectionEditor.tsx
│       │   └── EntryEditor.tsx
│       ├── workspace/
│       │   ├── ChatPanel.tsx  — Chat UI wired to AI routes + DB persistence
│       │   ├── LatexEditor.tsx
│       │   ├── PdfPreview.tsx
│       │   └── TopBar.tsx
│       └── formats/
│           └── FormatPdfPreview.tsx
├── lib/
│   ├── ai/                   — AI client, providers, prompts
│   ├── auth.ts               — Better Auth server config
│   ├── auth-client.ts        — Better Auth React client
│   ├── auth-server.ts        — Server-side session helpers
│   ├── db/
│   │   ├── index.ts          — Drizzle + libsql client
│   │   ├── schema.ts         — Auth + app tables + relations
│   │   ├── queries.ts        — Data access functions
│   │   ├── mappers.ts        — DB row → UI type mappers
│   │   └── migrate.ts        — libsql migration runner
│   ├── default-latex.ts      — Default resume template (Jake Gutierrez)
│   ├── types.ts              — TypeScript interfaces
│   └── mock-data.ts          — Seeding data (profile + format + resume)
├── app/api/
│   ├── auth/[...all]/
│   │   └── route.ts          — Better Auth catch-all handler
│   ├── chat/route.ts         — Generic chat completion (auth-gated)
│   ├── resume/
│   │   ├── generate/route.ts — Generate LaTeX resume (auth-gated)
│   │   └── edit/route.ts     — Edit existing LaTeX resume (auth-gated)
│   ├── profile/route.ts      — GET/PUT user profile (DB-backed)
│   ├── formats/
│   │   ├── route.ts          — List/create formats (DB-backed)
│   │   └── [id]/route.ts     — Get/update/delete format (DB-backed)
│   ├── workspaces/
│   │   ├── route.ts          — List/create workspaces (DB-backed)
│   │   └── [id]/
│   │       ├── route.ts      — Get/update workspace (DB-backed)
│   │       └── messages/
│   │           └── route.ts  — List/create chat messages (DB-backed)
└── proxy.ts                   — Route protection (cookie check, redirects to /sign-in)
```

## Routes

| Route | Page | Purpose |
|---|---|---|
| `/sign-in` | Sign in | Email/password sign-in |
| `/sign-up` | Sign up | Email/password sign-up |
| `/` | Dashboard | Generation prompt hero |
| `/resumes` | Resumes | List of resume workspaces |
| `/profile` | Profile | Source-data editor (DB-backed) |
| `/formats` | Formats | LaTeX template library (DB-backed) |
| `/formats/[id]` | Format editor | Edit LaTeX + live PDF preview (DB-backed) |
| `/workspace/[id]` | Workspace | Chat + LaTeX editor + preview |

## Design principles

- **Client-first UI** — most interactive components use `"use client"`.
- **Real AI and rendering** — AI and PDF compilation routes are auth-gated; Tectonic is called only from the server so its URL and optional API key are not exposed to the browser.
- **Session-scoped everything** — all API routes and DB operations are scoped by the authenticated user ID.
- **Lazy seeding** — on first access, new users get a default profile (from mock data) and one default ATS-friendly format (Jake Gutierrez template).
- **Convention over configuration** — follows Next.js App Router conventions with file-based routing.
- **Polished dark theme** — zinc/indigo palette with subtle gradients, glass morphism, and careful typography using Geist.

## Project constraints

- Do not add in-app LaTeX-to-PDF compilation; PDF generation uses the external service configured by `TECTONIC_API_URL`. Set `TECTONIC_API_KEY` when the service expects bearer authentication. The service receives JSON `{ "latex": "..." }` and may return PDF bytes or JSON containing `pdf`, `pdfBase64`, or `url`.
- Data is persisted via Drizzle/SQLite + Better Auth. Profile, workspaces, messages, and formats are stored in the DB.
- Keep UI functionality mocked where it is not yet wired to a real backend or external service.
