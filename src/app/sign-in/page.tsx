"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const fieldClass =
  "h-8 w-full rounded border border-input bg-background px-2.5 text-xs font-light text-foreground outline-none focus:border-zinc-500";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? "Unable to sign in.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xs space-y-4 rounded-lg border border-border bg-card p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-500 bg-zinc-700 text-[11px] text-zinc-100">
            R
          </div>
          <h1 className="pt-1 text-base font-normal tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to ResumeCraft.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label
            className="block text-[11px] text-muted-foreground"
            htmlFor="email"
          >
            Email
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          <label
            className="block text-[11px] text-muted-foreground"
            htmlFor="password"
          >
            Password
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          {error && (
            <p className="rounded border border-destructive/40 bg-background px-2.5 py-2 text-[11px] text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="h-8 w-full rounded border border-zinc-300 bg-zinc-200 text-xs font-normal text-zinc-900 shadow-sm hover:bg-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground">
          No account?{" "}
          <Link
            href="/sign-up"
            className="text-zinc-200 underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
