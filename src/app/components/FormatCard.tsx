"use client";

import { FileCode2 } from "lucide-react";
import Link from "next/link";
import type { Format } from "@/lib/types";

export default function FormatCard({ format }: { format: Format }) {
  return (
    <Link
      href={`/formats/${format.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-input"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-background">
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-80">
          <div className="h-2 w-1/3 rounded-full bg-muted" />
          <div className="h-2 w-2/3 rounded-full bg-muted" />
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted/70" />
          <div className="h-1.5 w-5/6 rounded-full bg-muted/70" />
          <div className="h-1.5 w-4/6 rounded-full bg-muted/70" />
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted/70" />
          <div className="h-1.5 w-3/4 rounded-full bg-muted/70" />
        </div>
        <div className="absolute bottom-3 right-3 rounded-md border border-border bg-card/90 p-1.5 text-muted-foreground backdrop-blur">
          <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-medium text-card-foreground">
            {format.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {format.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
