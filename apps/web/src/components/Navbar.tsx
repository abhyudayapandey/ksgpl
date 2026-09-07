"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useVisitor } from "@/lib/useVisitor";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        active ? "bg-brand text-white" : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { isAdmin, loading } = useAuth();
  const { visitor } = useVisitor();

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-brand-dark">
          KSGPL Catalog
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/catalog">Catalog</NavLink>
          <NavLink href="/company">Company</NavLink>
          {!loading && visitor?.isAdminEmail && (
            <NavLink href={isAdmin ? "/admin" : "/admin/login"}>Admin</NavLink>
          )}
          <NavLink href="/profile">Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}
