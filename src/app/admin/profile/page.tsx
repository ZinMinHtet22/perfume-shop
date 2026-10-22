import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export const instant = false;

function initialsOf(name: string | null, email: string): string {
  const parts = (name ?? email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase());
  return parts.join("") || "?";
}

export default async function AdminProfilePage() {
  await connection();
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    redirect("/login");
  }

  const joined = user.createdAt.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const details: { label: string; value: string; mono?: boolean }[] = [
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Member since", value: joined },
    { label: "Account ID", value: user.id, mono: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Badge variant="secondary">{user.role}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your administrator identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                aria-hidden
                className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
              >
                {initialsOf(user.name, user.email)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-medium">
                  {user.name ?? user.email}
                </p>
                <p className="text-muted-foreground truncate text-sm">
                  {user.email}
                </p>
              </div>
            </div>
            <dl className="divide-y">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <dt className="text-muted-foreground text-sm">
                    {d.label}
                  </dt>
                  <dd
                    className={`text-sm break-words sm:text-right ${
                      d.mono
                        ? "text-muted-foreground font-mono text-xs"
                        : "font-medium"
                    }`}
                  >
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change your password. It must be at least 8 characters with a
              letter and a number, and different from your current one. You
              will stay signed in on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
