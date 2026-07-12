import { defaultLatexTemplate } from "./default-latex";
import type { Format, Profile, ResumeProject } from "./types";

export const initialProfile: Profile = {
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
  bio: "Product-minded full-stack engineer with a passion for building polished, accessible web applications. I enjoy turning ambiguous requirements into delightful user experiences and mentoring junior developers along the way.",
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
          paragraph:
            "Leading the design system team and driving adoption across 40+ product squads.",
          bullets: [
            "Shipped a new component library used by 200+ engineers, reducing UI inconsistency tickets by 60%.",
            "Mentored 4 junior engineers through structured onboarding and weekly pair programming.",
            "Optimized core checkout flows, improving Lighthouse performance scores from 62 to 94.",
          ],
        },
        {
          id: "exp-2",
          title: "Full-Stack Developer",
          subtitle: "Notion",
          dateRange: "2019 — 2022",
          paragraph:
            "Built features across the web and desktop clients for a productivity platform used by millions.",
          bullets: [
            "Implemented real-time collaborative editing features using CRDTs and WebSockets.",
            "Reduced bundle size by 30% through code splitting and lazy loading strategies.",
            "Collaborated with designers to ship accessibility improvements achieving WCAG 2.1 AA compliance.",
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
          paragraph:
            "Graduated with honors. Focused on human-computer interaction and distributed systems.",
          bullets: [
            "GPA: 3.9/4.0",
            "Teaching Assistant for CS 61A and CS 160.",
          ],
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
            "Figma",
            "GraphQL",
            "Rust",
          ],
        },
      ],
    },
    {
      id: "achievements",
      name: "Achievements",
      types: ["bullets"],
      isDefault: true,
      entries: [
        {
          id: "ach-1",
          title: "Best Developer Experience Award",
          subtitle: "Stripe Internal Hackathon 2023",
          bullets: [
            "Built a CLI tool that reduced local setup time from 2 hours to 12 minutes.",
          ],
        },
        {
          id: "ach-2",
          title: "Open Source Maintainer",
          subtitle: "shadcn/ui",
          bullets: [
            "Contributed 15+ accessible primitives used by 50k+ projects.",
          ],
        },
      ],
    },
  ],
};

export const sampleLatex = `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\pagestyle{empty}
\\titleformat{\\section}{\\large\\bfseries}{}{{0em}}{}[\\titlerule]

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Alex Morgan}}\\[0.3em]
  San Francisco, USA \\quad \\href{mailto:alex.morgan@example.com}{alex.morgan@example.com}\\[0.2em]
  \\href{https://linkedin.com/in/alexmorgan}{linkedin.com/in/alexmorgan} \\quad \\href{https://alexmorgan.dev}{alexmorgan.dev}
\\end{center}

\\section{Summary}
Product-minded full-stack engineer with a passion for building polished,
accessible web applications. I enjoy turning ambiguous requirements into
delightful user experiences and mentoring junior developers along the way.

\\section{Experience}
\\textbf{Senior Frontend Engineer} \\hfill \\textit{Stripe, 2022 -- Present}\\
\\textit{Leading the design system team and driving adoption across 40+ product squads.}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Shipped a new component library used by 200+ engineers.
  \\item Mentored 4 junior engineers through structured onboarding.
  \\item Optimized checkout flows, improving Lighthouse scores from 62 to 94.
\\end{itemize}

\\textbf{Full-Stack Developer} \\hfill \\textit{Notion, 2019 -- 2022}\\
\\textit{Built features across web and desktop clients for millions of users.}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Implemented real-time collaborative editing with CRDTs.
  \\item Reduced bundle size by 30\\% via code splitting.
  \\item Shipped accessibility improvements achieving WCAG 2.1 AA.
\\end{itemize}

\\section{Education}
\\textbf{B.S. Computer Science} \\hfill \\textit{UC Berkeley, 2015 -- 2019}\\
Graduated with honors. Focused on HCI and distributed systems.

\\section{Skills}
TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Figma, GraphQL, Rust.

\\end{document}
`;

export const initialFormats: Format[] = [
  {
    id: "format-1",
    name: "Classic ATS-Friendly",
    description:
      "Jake Gutierrez sb2nov template - single-column, ATS-parseable, machine-readable PDF output.",
    latexCode: defaultLatexTemplate,
    isDefault: true,
  },
  {
    id: "format-2",
    name: "Modern Minimal",
    description:
      "Lots of white space, sans-serif headings, and a subtle sidebar for contact details.",
    latexCode: sampleLatex,
    isDefault: false,
  },
];

export const initialProjects: ResumeProject[] = [
  {
    id: "resume-1",
    name: "Senior Frontend Resume",
    targetRole: "Senior Frontend Engineer",
    version: "v1.3",
    updatedAt: "Edited 2 days ago",
    latexCode: sampleLatex,
    chat: [
      {
        id: "c1",
        role: "user",
        content:
          "Generate a concise resume for a Senior Frontend Engineer role at Stripe. Emphasize design systems and performance work.",
        timestamp: "Jul 9 at 1:17 PM",
      },
      {
        id: "c2",
        role: "assistant",
        content:
          "I've drafted a one-page LaTeX resume highlighting your design-system leadership, mentorship, and checkout performance wins. You can refine it in the code panel or ask me to adjust the tone.",
        timestamp: "Jul 9 at 1:18 PM",
      },
    ],
    meta: {
      prompt:
        "Generate a concise resume for a Senior Frontend Engineer role at Stripe.",
      jobDescription:
        "Looking for a senior frontend engineer to own the design system and improve core web vitals across checkout experiences.",
      company: "Stripe",
      tone: "Professional",
    },
  },
  {
    id: "resume-2",
    name: "Full-Stack Generalist",
    targetRole: "Full-Stack Engineer",
    version: "v0.9",
    updatedAt: "Edited 5 days ago",
    latexCode: sampleLatex,
    chat: [
      {
        id: "c3",
        role: "user",
        content:
          "Create a versatile full-stack resume suitable for early-stage startups.",
        timestamp: "Jul 6 at 10:42 AM",
      },
    ],
    meta: {
      prompt:
        "Create a versatile full-stack resume suitable for early-stage startups.",
      jobDescription: "",
      company: "",
      tone: "Casual",
    },
  },
];
