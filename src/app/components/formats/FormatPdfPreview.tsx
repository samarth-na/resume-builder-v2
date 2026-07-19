"use client";

import { Globe, Link, Mail, Phone } from "lucide-react";
import { initialProfile } from "@/lib/mock-data";

export default function FormatPdfPreview({
  formatName,
}: {
  formatName: string;
}) {
  const profile = initialProfile;

  return (
    <div className="flex h-full items-start justify-center overflow-y-auto bg-background p-8">
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-[16mm] text-zinc-900 shadow-xl">
        <div className="mb-4 border-b border-zinc-200 pb-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Previewing format: {formatName}
          </p>
        </div>

        <header className="border-b-2 border-zinc-900 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {profile.basic.fullName}
          </h1>
          <p className="mt-1 text-sm font-medium text-zinc-600">
            {profile.basic.city}, {profile.basic.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-700">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {profile.basic.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {profile.basic.phone}
            </span>
            <span className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              {profile.basic.linkedin}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {profile.basic.website}
            </span>
          </div>
        </header>

        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            Summary
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-800">
            {profile.bio}
          </p>
        </section>

        {profile.sections.map((section) => (
          <section key={section.id} className="mt-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              {section.name}
            </h2>
            <div className="mt-2 space-y-3">
              {section.entries.map((entry) => (
                <div key={entry.id}>
                  {(entry.title || entry.subtitle || entry.dateRange) && (
                    <div className="flex items-baseline justify-between">
                      <div>
                        {entry.title && (
                          <span className="text-sm font-semibold text-zinc-900">
                            {entry.title}
                          </span>
                        )}
                        {entry.title && entry.subtitle && (
                          <span className="text-sm text-zinc-600">
                            {" "}
                            — {entry.subtitle}
                          </span>
                        )}
                      </div>
                      {entry.dateRange && (
                        <span className="text-xs italic text-zinc-500">
                          {entry.dateRange}
                        </span>
                      )}
                    </div>
                  )}
                  {entry.paragraph && (
                    <p className="mt-1 text-sm leading-relaxed text-zinc-800">
                      {entry.paragraph}
                    </p>
                  )}
                  {entry.bullets && entry.bullets.length > 0 && (
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-zinc-800">
                      {entry.bullets.map((bullet, i) => (
                        <li key={`${entry.id}-bullet-${i}`}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {entry.tags && entry.tags.length > 0 && (
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-800">
                      {entry.tags.join(", ")}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8 border-t border-zinc-200 pt-3 text-center text-[10px] text-zinc-400">
          Mock PDF preview — rendered from sample profile data
        </div>
      </div>
    </div>
  );
}
