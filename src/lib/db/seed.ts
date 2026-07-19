#!/usr/bin/env bun
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { defaultLatexTemplate } from "@/lib/default-latex";
import type { ProfileSection } from "@/lib/types";
import { db } from "./index";
import {
  createMessage,
  createWorkspace,
  ensureDefaultFormat,
  ensureProfile,
} from "./queries";
import * as schema from "./schema";

const users = [
  {
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "password123",
    profile: {
      basic: {
        fullName: "Alex Morgan",
        age: "28",
        city: "San Francisco",
        country: "USA",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 012-3456",
        linkedin: "linkedin.com/in/alexmorgan",
        website: "alexmorgan.dev",
      },
      bio: "Product-minded full-stack engineer with 6+ years of experience building polished, accessible web applications at scale.",
      sections: [
        {
          id: "experience",
          name: "Experience",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "exp-1",
              title: "Senior Frontend Engineer",
              subtitle: "Stripe",
              dateRange: "2022 — Present",
              bullets: [
                "Shipped a component library used by 200+ engineers, reducing UI inconsistency tickets by 60%.",
                "Mentored 4 junior engineers through structured onboarding and weekly pair programming.",
                "Optimized core checkout flows, improving Lighthouse scores from 62 to 94.",
              ],
            },
            {
              id: "exp-2",
              title: "Full-Stack Developer",
              subtitle: "Notion",
              dateRange: "2019 — 2022",
              bullets: [
                "Implemented real-time collaborative editing using CRDTs and WebSockets.",
                "Reduced bundle size by 30% through code splitting and lazy loading.",
                "Achieved WCAG 2.1 AA compliance across the product.",
              ],
            },
          ],
        },
        {
          id: "education",
          name: "Education",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "edu-1",
              title: "B.S. Computer Science",
              subtitle: "UC Berkeley",
              dateRange: "2015 — 2019",
              bullets: ["GPA: 3.9/4.0", "Teaching Assistant for CS 61A."],
            },
          ],
        },
        {
          id: "skills",
          name: "Skills",
          types: ["tags"],
          isDefault: true,
          entries: [
            {
              id: "skills-1",
              tags: [
                "TypeScript",
                "React",
                "Next.js",
                "Node.js",
                "PostgreSQL",
                "Tailwind CSS",
                "GraphQL",
                "Rust",
              ],
            },
          ],
        },
      ] satisfies ProfileSection[],
    },
    workspaces: [
      {
        name: "Senior Frontend Resume",
        targetRole: "Senior Frontend Engineer",
        meta: {
          prompt: "Generate a resume for Senior Frontend Engineer at Stripe.",
          jobDescription:
            "Looking for a senior frontend engineer to own the design system and improve core web vitals.",
          company: "Stripe",
          tone: "Professional",
        },
        messages: [
          {
            role: "user" as const,
            content:
              "Generate a concise resume for a Senior Frontend Engineer role at Stripe. Emphasize design systems and performance work.",
          },
          {
            role: "assistant" as const,
            content:
              "I've drafted a one-page LaTeX resume highlighting your design-system leadership, mentorship, and checkout performance wins. You can refine it in the code panel or ask me to adjust the tone.",
          },
        ],
      },
    ],
  },
  {
    name: "Sarah Chen",
    email: "sarah@example.com",
    password: "password123",
    profile: {
      basic: {
        fullName: "Sarah Chen",
        age: "35",
        city: "New York",
        country: "USA",
        email: "sarah.chen@example.com",
        phone: "+1 (555) 234-5678",
        linkedin: "linkedin.com/in/sarahchen",
        website: "sarahchenlaw.com",
      },
      bio: "Harvard-educated corporate attorney specializing in M&A, venture capital, and technology transactions with 10+ years of experience at top-tier firms.",
      sections: [
        {
          id: "experience",
          name: "Experience",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "exp-1",
              title: "Partner",
              subtitle: "Skadden, Arps, Slate, Meagher & Flom LLP",
              dateRange: "2020 — Present",
              bullets: [
                "Lead cross-border M&A transactions valued at $2B+ across technology, healthcare, and financial services sectors.",
                "Advise Fortune 500 clients on regulatory compliance, securities law, and corporate governance matters.",
                "Manage a team of 8 associates and oversee $15M+ annual practice group revenue.",
              ],
            },
            {
              id: "exp-2",
              title: "Senior Associate",
              subtitle: "Kirkland & Ellis LLP",
              dateRange: "2016 — 2020",
              bullets: [
                "Structured and negotiated venture capital financings totaling $500M+ for emerging growth companies.",
                "Drafted and reviewed complex commercial agreements including SaaS licenses, IP assignments, and joint ventures.",
                "Successfully resolved 20+ high-stakes disputes through arbitration and mediation.",
              ],
            },
          ],
        },
        {
          id: "education",
          name: "Education",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "edu-1",
              title: "J.D., cum laude",
              subtitle: "Harvard Law School",
              dateRange: "2013 — 2016",
              bullets: [
                "Harvard Law Review — Executive Editor.",
                "Recipient of the Sears Prize for academic achievement.",
              ],
            },
            {
              id: "edu-2",
              title: "B.A. Political Science",
              subtitle: "Yale University",
              dateRange: "2009 — 2013",
              bullets: ["Summa cum laude. Phi Beta Kappa."],
            },
          ],
        },
        {
          id: "bar-admissions",
          name: "Bar Admissions",
          types: ["tags"],
          isDefault: false,
          entries: [
            {
              id: "bar-1",
              tags: [
                "New York State Bar",
                "California State Bar",
                "Southern District of New York",
                "Second Circuit Court of Appeals",
              ],
            },
          ],
        },
      ] satisfies ProfileSection[],
    },
    workspaces: [
      {
        name: "Corporate M&A Resume",
        targetRole: "Partner — Corporate M&A",
        meta: {
          prompt: "Draft a resume for a corporate M&A partner position.",
          jobDescription:
            "Seeking a partner-level corporate attorney with significant M&A and venture capital experience.",
          company: "Skadden",
          tone: "Formal",
        },
        messages: [
          {
            role: "user" as const,
            content:
              "Create a formal resume targeting a Partner role in Corporate M&A. Highlight deal experience and team leadership.",
          },
          {
            role: "assistant" as const,
            content:
              "I've prepared a tailored LaTeX resume emphasizing your $2B+ transaction portfolio, team leadership, and top-tier firm pedigree. The formatting follows legal industry standards.",
          },
        ],
      },
    ],
  },
  {
    name: "James Wilson",
    email: "james@example.com",
    password: "password123",
    profile: {
      basic: {
        fullName: "James Wilson",
        age: "32",
        city: "Seattle",
        country: "USA",
        email: "james.wilson@example.com",
        phone: "+1 (555) 345-6789",
        linkedin: "linkedin.com/in/jameswilson",
        website: "jameswilson.io",
      },
      bio: "Results-driven Product Manager with 8 years of experience launching B2B SaaS products. Skilled in driving product strategy from zero-to-one and leading cross-functional teams.",
      sections: [
        {
          id: "experience",
          name: "Experience",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "exp-1",
              title: "Senior Product Manager",
              subtitle: "Datadog",
              dateRange: "2021 — Present",
              bullets: [
                "Led the observability platform product line growing ARR from $12M to $45M in 2 years.",
                "Shipped 3 major platform features including custom dashboards and alert intelligence, driving NPS from 42 to 68.",
                "Managed a roadmap spanning 4 engineering teams (32 engineers) with quarterly OKR planning.",
              ],
            },
            {
              id: "exp-2",
              title: "Product Manager",
              subtitle: "Zapier",
              dateRange: "2018 — 2021",
              bullets: [
                "Owned the integrations marketplace growing from 200 to 1,500+ app integrations.",
                "Launched a partner API program that onboarded 300+ third-party developers in the first year.",
                "Increased monthly active integration usage by 180% through UX improvements and developer tooling.",
              ],
            },
          ],
        },
        {
          id: "education",
          name: "Education",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "edu-1",
              title: "MBA",
              subtitle: "Stanford Graduate School of Business",
              dateRange: "2016 — 2018",
              bullets: [
                "Arjay Miller Scholar (top 10%).",
                "Co-president of the Product Management Club.",
              ],
            },
            {
              id: "edu-2",
              title: "B.S. Computer Engineering",
              subtitle: "University of Michigan",
              dateRange: "2010 — 2014",
              bullets: ["Magna cum laude."],
            },
          ],
        },
        {
          id: "certifications",
          name: "Certifications",
          types: ["bullets"],
          isDefault: false,
          entries: [
            {
              id: "cert-1",
              title: "Certified Scrum Product Owner (CSPO)",
              subtitle: "Scrum Alliance",
              dateRange: "2020",
            },
            {
              id: "cert-2",
              title: "AWS Cloud Practitioner",
              subtitle: "Amazon Web Services",
              dateRange: "2022",
            },
          ],
        },
      ] satisfies ProfileSection[],
    },
    workspaces: [
      {
        name: "Senior PM Resume",
        targetRole: "Senior Product Manager",
        meta: {
          prompt: "Create a product management resume for a Senior PM role.",
          jobDescription:
            "Hiring a senior PM to lead the core platform team and drive product-led growth.",
          company: "Datadog",
          tone: "Professional",
        },
        messages: [
          {
            role: "user" as const,
            content:
              "Build a results-focused PM resume. Showcase revenue growth, shipped features, and cross-team leadership.",
          },
          {
            role: "assistant" as const,
            content:
              "Your PM resume is ready with quantified impact: $12M→$45M ARR growth, 1,500+ integrations shipped, and 32-person team leadership. The LaTeX is in the code panel.",
          },
        ],
      },
    ],
  },
  {
    name: "Maria Garcia",
    email: "maria@example.com",
    password: "password123",
    profile: {
      basic: {
        fullName: "Maria Garcia",
        age: "30",
        city: "Austin",
        country: "USA",
        email: "maria.garcia@example.com",
        phone: "+1 (555) 456-7890",
        linkedin: "linkedin.com/in/mariagarcia",
        website: "mariagarcia.dev",
      },
      bio: "PhD-level Data Scientist with 6 years of experience building ML pipelines and production models at scale. Passionate about NLP, recommendation systems, and MLOps.",
      sections: [
        {
          id: "experience",
          name: "Experience",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "exp-1",
              title: "Senior Data Scientist",
              subtitle: "Spotify",
              dateRange: "2021 — Present",
              bullets: [
                "Built and deployed a real-time personalization model serving 50M+ daily active users, improving session retention by 12%.",
                "Designed A/B testing framework reducing experiment iteration time from 3 weeks to 4 days.",
                "Led migration of ML training pipeline from Airflow to Kubeflow, reducing training costs by 40%.",
              ],
            },
            {
              id: "exp-2",
              title: "Data Scientist",
              subtitle: "Netflix",
              dateRange: "2019 — 2021",
              bullets: [
                "Developed content recommendation algorithms handling 100B+ daily events using Spark and TensorFlow.",
                "Created anomaly detection system for streaming quality monitoring, reducing P1 incidents by 35%.",
                "Published 2 papers at RecSys and KDD on session-based recommendation.",
              ],
            },
          ],
        },
        {
          id: "education",
          name: "Education",
          types: ["bullets"],
          isDefault: true,
          entries: [
            {
              id: "edu-1",
              title: "Ph.D. Computer Science",
              subtitle: "MIT",
              dateRange: "2015 — 2019",
              bullets: [
                "Dissertation: 'Scalable Session-Based Recommendation with Graph Neural Networks.'",
                "Published 8 papers at NeurIPS, ICML, and RecSys with 1,200+ citations.",
              ],
            },
            {
              id: "edu-2",
              title: "B.S. Mathematics & Computer Science",
              subtitle: "Stanford University",
              dateRange: "2011 — 2015",
              bullets: ["Phi Beta Kappa. Dean's List all semesters."],
            },
          ],
        },
        {
          id: "publications",
          name: "Selected Publications",
          types: ["bullets"],
          isDefault: false,
          entries: [
            {
              id: "pub-1",
              title: "Session-Aware Graph Neural Networks for Recommendation",
              subtitle: "KDD 2023",
              bullets: ["Presented at the main conference track."],
            },
            {
              id: "pub-2",
              title: "Efficient Online Learning for Personalization at Scale",
              subtitle: "RecSys 2022",
              bullets: ["Received Best Paper Honorable Mention."],
            },
          ],
        },
      ] satisfies ProfileSection[],
    },
    workspaces: [
      {
        name: "ML Data Scientist Resume",
        targetRole: "Staff Data Scientist",
        meta: {
          prompt:
            "Draft a resume for a Staff Data Scientist position emphasizing ML production experience.",
          jobDescription:
            "Looking for a staff-level data scientist to lead ML platform initiatives and mentor junior team members.",
          company: "Spotify",
          tone: "Technical",
        },
        messages: [
          {
            role: "user" as const,
            content:
              "Generate a resume for a Staff Data Scientist role. Highlight production ML, personalization, and team leadership.",
          },
          {
            role: "assistant" as const,
            content:
              "Your resume highlights 50M+ user personalization models, 100B daily event pipelines, and 8 peer-reviewed publications. The LaTeX is formatted for ATS compatibility.",
          },
        ],
      },
    ],
  },
];

async function seed() {
  for (const u of users) {
    // Use Better Auth's API to create users with proper password hashing
    const result = await auth.api.signUpEmail({
      body: { email: u.email, password: u.password, name: u.name },
    });

    if (!result) {
      console.error(`Failed to create user: ${u.email}`);
      continue;
    }

    const userId = result.user.id;

    // Update profile with custom data (ensureProfile creates a default one)
    await ensureProfile(userId);
    await db
      .update(schema.profile)
      .set({
        basic: u.profile.basic,
        bio: u.profile.bio,
        sections: u.profile.sections,
      })
      .where(eq(schema.profile.userId, userId));

    await ensureDefaultFormat(userId);

    for (const ws of u.workspaces) {
      const workspace = await createWorkspace(userId, {
        name: ws.name,
        targetRole: ws.targetRole,
      });
      await db
        .update(schema.workspace)
        .set({
          latexCode: defaultLatexTemplate,
          metaPrompt: ws.meta.prompt,
          metaJobDescription: ws.meta.jobDescription,
          metaCompany: ws.meta.company,
          metaTone: ws.meta.tone,
        })
        .where(eq(schema.workspace.id, workspace.id));
      for (const msg of ws.messages) {
        await createMessage(workspace.id, msg.role, msg.content);
      }
    }

    console.log(`Created user: ${u.email} / ${u.password}`);
  }

  console.log(
    "\nSeed complete. Sign in with any of the emails above and password: password123",
  );
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
