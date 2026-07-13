import { and, asc, desc, eq } from "drizzle-orm";
import { defaultLatexTemplate } from "@/lib/default-latex";
import { initialProfile } from "@/lib/mock-data";
import type { ChatMessage, Format, Profile, ResumeProject } from "@/lib/types";
import { db } from "./index";
import {
  formatRowToFormat,
  messageRowToChatMessage,
  profileRowToProfile,
  profileToString,
  workspaceRowToResumeProject,
} from "./mappers";
import * as schema from "./schema";

const { format, message, profile, workspace } = schema;

function newId() {
  return crypto.randomUUID();
}

// --- Profile ---------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);
  return row ? profileRowToProfile(row) : null;
}

export async function ensureProfile(userId: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const [row] = await db
    .insert(profile)
    .values({
      id: newId(),
      userId,
      basic: initialProfile.basic,
      bio: initialProfile.bio,
      sections: initialProfile.sections,
    })
    .returning();
  return profileRowToProfile(row);
}

export async function upsertProfile(
  userId: string,
  data: Profile,
): Promise<Profile> {
  const [existing] = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);
  if (existing) {
    const [row] = await db
      .update(profile)
      .set({ basic: data.basic, bio: data.bio, sections: data.sections })
      .where(eq(profile.id, existing.id))
      .returning();
    return profileRowToProfile(row);
  }
  const [row] = await db
    .insert(profile)
    .values({
      id: newId(),
      userId,
      basic: data.basic,
      bio: data.bio,
      sections: data.sections,
    })
    .returning();
  return profileRowToProfile(row);
}

// --- Formats ---------------------------------------------------------------

export async function listFormats(userId: string): Promise<Format[]> {
  const rows = await db
    .select()
    .from(format)
    .where(eq(format.userId, userId))
    .orderBy(asc(format.createdAt));
  return rows.map(formatRowToFormat);
}

export async function ensureDefaultFormat(userId: string): Promise<void> {
  const rows = await db
    .select({ id: format.id })
    .from(format)
    .where(eq(format.userId, userId))
    .limit(1);
  if (rows.length > 0) return;
  await db.insert(format).values({
    id: newId(),
    userId,
    name: "Classic ATS-Friendly",
    description:
      "Jake Gutierrez sb2nov template - single-column, ATS-parseable, machine-readable PDF output.",
    latexCode: defaultLatexTemplate,
    isDefault: true,
  });
}

export async function getFormat(
  userId: string,
  id: string,
): Promise<Format | null> {
  const [row] = await db
    .select()
    .from(format)
    .where(and(eq(format.id, id), eq(format.userId, userId)))
    .limit(1);
  return row ? formatRowToFormat(row) : null;
}

export async function getDefaultFormat(userId: string): Promise<Format | null> {
  const [row] = await db
    .select()
    .from(format)
    .where(and(eq(format.userId, userId), eq(format.isDefault, true)))
    .limit(1);
  if (row) return formatRowToFormat(row);
  // Fallback: return first format
  const [first] = await db
    .select()
    .from(format)
    .where(eq(format.userId, userId))
    .limit(1);
  return first ? formatRowToFormat(first) : null;
}

export async function createFormat(
  userId: string,
  data: Pick<Format, "name" | "description" | "latexCode">,
): Promise<Format> {
  const [row] = await db
    .insert(format)
    .values({
      id: newId(),
      userId,
      name: data.name,
      description: data.description || "",
      latexCode: data.latexCode,
      isDefault: false,
    })
    .returning();
  return formatRowToFormat(row);
}

export async function updateFormat(
  userId: string,
  id: string,
  data: Partial<
    Pick<Format, "name" | "description" | "latexCode" | "isDefault">
  >,
): Promise<Format | null> {
  const [row] = await db
    .update(format)
    .set(data)
    .where(and(eq(format.id, id), eq(format.userId, userId)))
    .returning();
  return row ? formatRowToFormat(row) : null;
}

export async function deleteFormat(
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await db
    .delete(format)
    .where(and(eq(format.id, id), eq(format.userId, userId)))
    .returning({ id: format.id });
  return result.length > 0;
}

// --- Workspaces ------------------------------------------------------------

export async function listWorkspaces(userId: string): Promise<ResumeProject[]> {
  const rows = await db
    .select()
    .from(workspace)
    .where(eq(workspace.userId, userId))
    .orderBy(desc(workspace.updatedAt));
  return rows.map((row) => workspaceRowToResumeProject(row, []));
}

export async function getWorkspace(
  userId: string,
  id: string,
): Promise<ResumeProject | null> {
  const [wsRow] = await db
    .select()
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.userId, userId)))
    .limit(1);
  if (!wsRow) return null;
  const messageRows = await db
    .select()
    .from(message)
    .where(eq(message.workspaceId, id))
    .orderBy(asc(message.createdAt));
  return workspaceRowToResumeProject(wsRow, messageRows);
}

export async function createWorkspace(
  userId: string,
  data?: { name?: string; targetRole?: string },
): Promise<ResumeProject> {
  const [row] = await db
    .insert(workspace)
    .values({
      id: newId(),
      userId,
      name: data?.name ?? "Untitled Resume",
      targetRole: data?.targetRole ?? null,
    })
    .returning();
  return workspaceRowToResumeProject(row, []);
}

export async function updateWorkspace(
  userId: string,
  id: string,
  data: Partial<{
    name: string;
    targetRole: string;
    version: string;
    latexCode: string;
    metaPrompt: string;
    metaJobDescription: string;
    metaCompany: string;
    metaTone: string;
  }>,
): Promise<ResumeProject | null> {
  const [row] = await db
    .update(workspace)
    .set(data)
    .where(and(eq(workspace.id, id), eq(workspace.userId, userId)))
    .returning();
  if (!row) return null;
  const messageRows = await db
    .select()
    .from(message)
    .where(eq(message.workspaceId, id))
    .orderBy(asc(message.createdAt));
  return workspaceRowToResumeProject(row, messageRows);
}

// --- Messages --------------------------------------------------------------

export async function listMessages(
  workspaceId: string,
): Promise<ChatMessage[]> {
  const rows = await db
    .select()
    .from(message)
    .where(eq(message.workspaceId, workspaceId))
    .orderBy(asc(message.createdAt));
  return rows.map(messageRowToChatMessage);
}

export async function createMessage(
  workspaceId: string,
  role: "system" | "user" | "assistant",
  content: string,
): Promise<ChatMessage> {
  const [row] = await db
    .insert(message)
    .values({
      id: newId(),
      workspaceId,
      role,
      content,
    })
    .returning();
  return messageRowToChatMessage(row);
}

// --- AI helpers ------------------------------------------------------------

export async function getProfileStringForUser(
  userId: string,
  provided?: string,
): Promise<string> {
  if (provided && provided.trim().length > 0) return provided;
  const profile = await ensureProfile(userId);
  return profileToString(profile);
}
