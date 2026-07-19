"use client";

import type { BasicInfo } from "@/lib/types";

const fields: { key: keyof BasicInfo; label: string; placeholder: string }[] = [
  { key: "fullName", label: "Full name", placeholder: "Jane Doe" },
  { key: "age", label: "Age", placeholder: "28" },
  { key: "city", label: "City", placeholder: "San Francisco" },
  { key: "country", label: "Country", placeholder: "USA" },
  { key: "email", label: "Email", placeholder: "jane@example.com" },
  { key: "phone", label: "Phone", placeholder: "+1 555 012 3456" },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/janedoe",
  },
  { key: "website", label: "Website", placeholder: "janedoe.dev" },
];

export default function BasicInfoForm({
  value,
  onChange,
  onBlur,
}: {
  value: BasicInfo;
  onChange: (info: BasicInfo) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <label
            htmlFor={field.key}
            className="text-xs font-medium text-muted-foreground"
          >
            {field.label}
          </label>
          <input
            id={field.key}
            type="text"
            value={value[field.key]}
            onChange={(e) =>
              onChange({ ...value, [field.key]: e.target.value })
            }
            onBlur={onBlur}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring"
          />
        </div>
      ))}
    </div>
  );
}
