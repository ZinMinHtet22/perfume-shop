import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./checkout-client";

export const instant = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  await connection();
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("Checkout");

  const [paymentSetting, shippingSetting, user] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "paymentMethods" } }),
    prisma.siteSetting.findUnique({ where: { key: "shipping" } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true, email: true },
    }),
  ]);

  const payCfg = (paymentSetting?.value ?? {}) as {
    kbzpay?: { enabled?: boolean; qrImageUrl?: string };
    bank?: { enabled?: boolean };
    cod?: { enabled?: boolean };
  };
  const shipCfg = (shippingSetting?.value ?? {}) as {
    feeMmk?: number;
    freeOverMmk?: number;
  };

  const methods = [
    payCfg.kbzpay?.enabled !== false ? "KBZPAY" : null,
    payCfg.bank?.enabled !== false ? "BANK" : null,
    payCfg.cod?.enabled !== false ? "COD" : null,
  ].filter((m): m is "KBZPAY" | "BANK" | "COD" => m !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <CheckoutClient
        locale={locale}
        methods={methods}
        feeMmk={shipCfg.feeMmk ?? 3000}
        freeOverMmk={shipCfg.freeOverMmk ?? 150000}
        defaultName={user?.name ?? ""}
        defaultPhone={user?.phone ?? ""}
      />
    </div>
  );
}
