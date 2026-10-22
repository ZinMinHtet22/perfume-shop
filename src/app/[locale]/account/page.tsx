import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { signOutAction } from "../login/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

type Props = {
  params: Promise<{ locale: string }>;
};

function initialsOf(name: string | null, email: string): string {
  const parts = (name ?? email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase());
  return parts.join("") || "?";
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  await connection();
  setRequestLocale(locale);
  const t = await getTranslations("Account");

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, wishlist: true, reviews: true } },
    },
  });
  if (!dbUser) {
    redirect("/login");
  }

  const spent = await prisma.order.aggregate({
    where: {
      userId: session.user.id,
      status: { in: ["PAID", "CONFIRMED", "SHIPPED", "DELIVERED"] },
    },
    _sum: { total: true },
  });

  const isAdmin = dbUser.role === "ADMIN";
  const joined = dbUser.createdAt.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const stats: { label: string; value: string }[] = [
    { label: t("orders"), value: String(dbUser._count.orders) },
    { label: t("wishlist"), value: String(dbUser._count.wishlist) },
    { label: t("reviews"), value: String(dbUser._count.reviews) },
    { label: t("totalSpent"), value: formatMMK(spent._sum.total ?? 0) },
  ];

  const details: { label: string; value: string; muted?: boolean }[] = [
    { label: t("name"), value: dbUser.name ?? "—" },
    { label: t("email"), value: dbUser.email },
    {
      label: t("phone"),
      value: dbUser.phone ?? t("notProvided"),
      muted: !dbUser.phone,
    },
    { label: t("role"), value: isAdmin ? t("roleAdmin") : t("roleUser") },
    { label: t("memberSince"), value: joined },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold sm:size-16 sm:text-xl"
          >
            {initialsOf(dbUser.name, dbUser.email)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {dbUser.name ?? dbUser.email}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {dbUser.email}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? t("roleAdmin") : t("roleUser")}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t("memberSince")} {joined}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-xl border py-4 shadow-sm px-4 sm:px-5"
          >
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {s.label}
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("profileDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <dt className="text-muted-foreground text-sm">{d.label}</dt>
                  <dd
                    className={`text-sm font-medium break-words sm:text-right ${
                      d.muted ? "text-muted-foreground font-normal" : ""
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
            <CardTitle>{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/shop">{t("continueShopping")}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${locale}/wishlist`}>{t("wishlist")}</Link>
            </Button>
            {isAdmin ? (
              <Button asChild className="w-full justify-start">
                <Link href="/admin">{t("adminPanel")}</Link>
              </Button>
            ) : null}
            <form action={signOutAction} className="mt-2">
              <Button
                type="submit"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive w-full justify-start"
              >
                {t("signOut")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
