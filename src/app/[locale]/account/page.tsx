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
    <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-6 lg:py-20">
      <section className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-[4px] border border-champagne/40 bg-champagne/10 text-lg font-medium text-champagne sm:size-16 sm:text-xl"
          >
            {initialsOf(dbUser.name, dbUser.email)}
          </div>
          <div className="min-w-0">
            <p className="eyebrow text-champagne">Account</p>
            <h1 className="mt-2 truncate font-display text-3xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-4xl">
              {dbUser.name ?? dbUser.email}
            </h1>
            <p className="mt-1 truncate text-sm text-ash">{dbUser.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className="rounded-[2px]"
              >
                {isAdmin ? t("roleAdmin") : t("roleUser")}
              </Badge>
              <span className="text-xs text-taupe">
                {t("memberSince")} {joined}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
          >
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[4px] border border-border bg-surface/40 px-4 py-4 sm:px-5"
          >
            <p className="eyebrow text-taupe">{s.label}</p>
            <p className="mt-2 truncate tabular text-lg font-medium text-ivory sm:text-xl">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[4px] border-border bg-surface/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-normal text-ivory">
              {t("profileDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <dt className="text-sm text-ash">{d.label}</dt>
                  <dd
                    className={`break-words text-sm font-medium text-ivory sm:text-right ${
                      d.muted ? "font-normal text-taupe" : ""
                    }`}
                  >
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-[4px] border-border bg-surface/30">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-normal text-ivory">
              {t("quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
            >
              <Link href="/shop">{t("continueShopping")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
            >
              <Link href={`/${locale}/wishlist`}>{t("wishlist")}</Link>
            </Button>
            {isAdmin ? (
              <Button
                asChild
                className="w-full justify-start rounded-[4px] hover:bg-brass"
              >
                <Link href="/admin">{t("adminPanel")}</Link>
              </Button>
            ) : null}
            <form action={signOutAction} className="mt-2">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start rounded-[4px] text-ash hover:bg-surface hover:text-destructive"
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
