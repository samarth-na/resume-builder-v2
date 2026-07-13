import { NextResponse } from "next/server";

export function jsonResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  status = 500,
): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}

export function validateString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required and must be a non-empty string.`);
  }
  return value;
}

export function validateOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}
