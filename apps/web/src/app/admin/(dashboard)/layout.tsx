"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

function SubNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm rounded-md ${
        active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {children}
    </Link>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace("/admin/login");
    } else if (!isAdmin) {
      router.replace("/admin/login");
    }
  }, [loading, profile, isAdmin, router]);

  if (loading) return <p className="text-neutral-500 text-sm">Loading…</p>;
  if (!isAdmin) return <p className="text-neutral-500 text-sm">Redirecting to sign in…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500">Signed in as {profile?.email}</p>
      </div>
      <div className="flex gap-2">
        <SubNavLink href="/admin">Catalog Types</SubNavLink>
        <SubNavLink href="/admin/products">Products</SubNavLink>
        <SubNavLink href="/admin/company">Company Info</SubNavLink>
      </div>
      {children}
    </div>
  );
}
