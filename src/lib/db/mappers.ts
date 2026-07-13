import type { ChatMessage, Format, Profile, ResumeProject } from "@/lib/types";
import type {
  format as FormatTable,
  message as MessageTable,
  profile as ProfileTable,
  workspace as WorkspaceTable,
} from "./schema";

type FormatRow = typeof FormatTable.$inferSelect;
type MessageRow = typeof MessageTable.$inferSelect;
type ProfileRow = typeof ProfileTable.$inferSelect;
type WorkspaceRow = typeof WorkspaceTable.$inferSelect;

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Edited just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Edited ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Edited ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Edited ${days}d ago`;
  return `Edited on ${date.toLocaleDateString()}`;
}

export function formatRowToFormat(row: FormatRow): Format {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    latexCode: row.latexCode,
    isDefault: row.isDefault,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function messageRowToChatMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: formatRelativeTime(row.createdAt),
  };
}

export function workspaceRowToResumeProject(
  row: WorkspaceRow,
  messages: MessageRow[],
): ResumeProject {
  return {
    id: row.id,
    name: row.name,
    targetRole: row.targetRole ?? "",
    version: row.version,
    updatedAt: formatRelativeTime(row.updatedAt),
    latexCode: row.latexCode,
    chat: messages
      .filter((m) => m.role !== "system")
      .map(messageRowToChatMessage),
    meta: {
      prompt: row.metaPrompt ?? "",
      jobDescription: row.metaJobDescription ?? "",
      company: row.metaCompany ?? "",
      tone: row.metaTone ?? "",
    },
    userId: row.userId,
    createdAt: row.createdAt,
  };
}

export function profileRowToProfile(row: ProfileRow): Profile {
  return {
    basic: row.basic,
    bio: row.bio,
    sections: row.sections,
  };
}

export function profileToString(profile: Profile): string {
  const lines: string[] = [];
  const b = profile.basic;
  lines.push(
    `Name: ${b.fullName}`,
    `Location: ${b.city}, ${b.country}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    `LinkedIn: ${b.linkedin}`,
    `Website: ${b.website}`,
  );
  if (profile.bio.trim()) lines.push(``, `Summary: ${profile.bio}`);
  for (const section of profile.sections) {
    lines.push(``, `## ${section.name}`);
    for (const entry of section.entries) {
      const head = [entry.title, entry.subtitle, entry.dateRange]
        .filter(Boolean)
        .join(" — ");
      if (head) lines.push(head);
      if (entry.paragraph) lines.push(entry.paragraph);
      if (entry.bullets?.length) {
        for (const bullet of entry.bullets) lines.push(`- ${bullet}`);
      }
      if (entry.tags?.length) lines.push(entry.tags.join(", "));
    }
  }
  return lines.join("\n");
}
