export type SectionType = "paragraph" | "bullets" | "tags";

export interface ProfileEntry {
  id: string;
  title?: string;
  subtitle?: string;
  dateRange?: string;
  paragraph?: string;
  bullets?: string[];
  tags?: string[];
}

export interface ProfileSection {
  id: string;
  name: string;
  types: SectionType[];
  entries: ProfileEntry[];
  isDefault?: boolean;
}

export interface BasicInfo {
  fullName: string;
  age: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
}

export interface Profile {
  basic: BasicInfo;
  bio: string;
  sections: ProfileSection[];
}

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  targetRole: string;
  version: string;
  updatedAt: string;
  latexCode: string;
  chat: ChatMessage[];
  meta: {
    prompt: string;
    jobDescription: string;
    company: string;
    tone: string;
  };
  userId?: string;
  createdAt?: Date;
}

export interface Format {
  id: string;
  name: string;
  description: string;
  latexCode: string;
  isDefault?: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
