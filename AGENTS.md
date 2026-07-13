<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses **Next.js 16.2.10 + React 19.2.4**. APIs, conventions, and file structure differ from training data. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

See [OVERVIEW.md](./OVERVIEW.md) for the project idea, scope, and architecture.

## Developer commands

Use `bun` (lockfile is `bun.lock`):

- `bun run dev` — start dev server on http://localhost:3000
- `bun run build` — production build
- `bun run lint` — `biome check`
- `bun run format` — `biome format --write` (also organizes imports)
- `bun run db:migrate` — apply Drizzle migrations via `@libsql/client`
- `bun run db:generate` — generate migration SQL from schema changes
- `bun run db:push` — push schema directly (drizzle-kit; needs Node SQLite driver)

There are no tests yet. Verify with `bun run lint && bun run build`.

## Toolchain quirks

- **Linting / formatting:** Biome 2.2.0 (`biome.json`). It lints, formats, and organizes imports. Run `bun run format` before committing.
- **Tailwind:** v4 configured in `src/app/globals.css` with `@import "tailwindcss"` and `@theme inline`. PostCSS plugin is `@tailwindcss/postcss`.
- **Path alias:** `@/*` maps to `./src/*`.
- **Fonts:** Geist Sans / Mono loaded via `next/font/google` in `src/app/layout.tsx`.
- **SQLite driver:** `@libsql/client` (not `bun:sqlite`) for Node/Next.js build compatibility. Migrations run via a custom `src/lib/db/migrate.ts` script using `drizzle-orm/libsql/migrator`. `drizzle-kit generate` works without a driver; `drizzle-kit push/studio` need a Node SQLite driver.
- **Auth:** Better Auth with `drizzle-adapter`, email/password enabled, `nextCookies` plugin for server-action cookie handling. Auth pages at `/sign-in` and `/sign-up`.

## App structure

App Router under `src/app/`:

- `/` — Dashboard (workspace list + generation prompt)
- `/sign-in` — Email/password sign-in
- `/sign-up` — Email/password sign-up
- `/profile` — Personal info / source-data hub (DB-backed)
- `/formats` — LaTeX format/template library (DB-backed)
- `/formats/[id]` — Format editor (LaTeX code + mock PDF preview)
- `/workspace/[id]` — Resume builder (chat + preview/code toggle)

Most pages are Client Components (`"use client"`) for interactive state.

## Backend / AI

API routes require a valid session cookie (Better Auth). Unauthenticated requests get `401`.

AI routes (stateless, no DB writes):

- `POST /api/chat` — generic chat completion
- `POST /api/resume/generate` — generate a LaTeX resume (profile loaded from DB if not supplied)
- `POST /api/resume/edit` — edit an existing LaTeX resume (profile loaded from DB if not supplied)

Data routes (DB-backed, user-scoped):

- `GET / PUT /api/profile` — get/upsert user profile (lazy-seeded from mock on first GET)
- `GET / POST /api/formats` — list/create formats (lazy-seeds default ATS format on first GET)
- `GET / PUT / DELETE /api/formats/[id]` — get/update/delete a format
- `GET / POST /api/workspaces` — list/create resume workspaces
- `GET / PUT /api/workspaces/[id]` — get/update a workspace (latexCode, meta, name)
- `GET / POST /api/workspaces/[id]/messages` — list/create chat messages

Auth route: `GET / POST /api/auth/[...all]` — Better Auth catch-all handler.

The AI client lives in `src/lib/ai/` and supports OpenAI and Nvidia providers via `AI_PROVIDER`, `OPENAI_API_KEY`, and `NVIDIA_API_KEY` env vars. See `.env.local.example`.

DB: Drizzle ORM with SQLite via `@libsql/client`. Schema in `src/lib/db/schema.ts`. Mappers in `src/lib/db/mappers.ts`. Server queries in `src/lib/db/queries.ts`.

## Project constraints

- **PDF rendering is external.** Do not add in-app LaTeX-to-PDF compilation. The UI shows a mocked PDF preview; real PDF generation happens through an external service.
- **Data is persisted via Drizzle/SQLite + Better Auth.** Profile, workspaces, messages, and formats are stored in the DB. Lazy-seeding provides mock defaults for new users.
- Keep UI functionality mocked where it is not yet wired to a real backend or external service.
