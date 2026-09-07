"use client";

import { Navbar } from "@/components/Navbar";
import { VisitorGate } from "@/components/VisitorGate";
import { useVisitor } from "@/lib/useVisitor";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { visitor, loading } = useVisitor();

  if (loading) return null;
  if (!visitor) return <VisitorGate />;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
