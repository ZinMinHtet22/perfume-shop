import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { AdminShell } from "./admin-shell";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const instant = false;

export const metadata = {
  title: "Admin — Perfume Shop",
  robots: { index: false, follow: false },
};

function initialsOf(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const parts = (name ?? email ?? "A")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase());
  return parts.join("") || "A";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/en");
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AdminShell
          userName={session.user.name ?? session.user.email ?? "Admin"}
          userEmail={session.user.email ?? ""}
          initials={initialsOf(session.user.name, session.user.email)}
        >
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
