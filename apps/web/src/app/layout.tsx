import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";
import { VisitorProvider } from "@/lib/useVisitor";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "KSGPL Catalog",
  description: "Kundan Switchgears Pvt Ltd — product catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VisitorProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </VisitorProvider>
      </body>
    </html>
  );
}
