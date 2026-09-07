import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KSGPL Catalog",
  description: "Kundan Switchgears Pvt Ltd — product catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
