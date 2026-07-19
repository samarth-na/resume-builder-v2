#!/usr/bin/env bun
import { eq } from "drizzle-orm";
import { createResumeAiClient } from "@/lib/ai/client";
import { db } from "@/lib/db/index";
import { profileToString } from "@/lib/db/mappers";
import {
  ensureDefaultFormat,
  ensureProfile,
  getDefaultFormat,
} from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";

const EMAIL = "demo@test.com";
const _PASSWORD = "password123";

async function main() {
  const [user] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, EMAIL))
    .limit(1);

  if (!user) {
    console.error(`User ${EMAIL} not found. Create one first.`);
    process.exit(1);
  }

  const userId = user.id;
  console.log(`User: ${user.name} <${user.email}> (${userId})`);

  const profile = await ensureProfile(userId);
  const profileStr = profileToString(profile);
  console.log(`\n--- Profile string (${profileStr.length} chars) ---`);
  console.log(profileStr);

  await ensureDefaultFormat(userId);
  const fmt = await getDefaultFormat(userId);
  const formatLatex = fmt?.latexCode ?? "";
  console.log(`\n--- Format LaTeX (${formatLatex.length} chars) ---`);
  console.log(`${formatLatex.substring(0, 300)}...`);

  const targetRole = "Senior Frontend Engineer";
  const company = "Stripe";
  const jobDescription =
    "Looking for a senior frontend engineer to own the design system and improve core web vitals.";
  const tone = "Professional";
  const prompt =
    "Generate a concise resume highlighting design system leadership and performance optimization.";

  const client = createResumeAiClient();
  const result = await client.generateResume(
    {
      profile: profileStr,
      targetRole,
      company,
      jobDescription,
      tone,
      extraInstructions: prompt,
      formatLatex,
    },
    { temperature: 0.3, maxTokens: 4096 },
  );

  console.log(`\n=== GENERATED LATEX (${result.content.length} chars) ===`);
  console.log(result.content);
  if (result.usage) {
    console.log(`\n=== USAGE ===`);
    console.log(JSON.stringify(result.usage, null, 2));
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
