"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useVisitor } from "@/lib/useVisitor";

export default function AdminLoginPage() {
  const { signIn, profile } = useAuth();
  const { visitor } = useVisitor();
  const router = useRouter();
  const email = visitor?.email ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message ?? "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin sign in</h1>
      <p className="text-sm text-neutral-500">
        Signing in as <span className="font-medium text-neutral-700">{email}</span>. Enter your
        admin password to continue.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {profile && profile.role !== "admin" && (
          <p className="text-sm text-amber-600">
            Signed in, but this account is not an admin. Ask an existing admin to promote it.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white rounded-md px-3 py-2 font-medium disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
