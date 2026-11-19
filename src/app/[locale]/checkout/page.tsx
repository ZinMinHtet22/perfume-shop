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
    <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
      <div className="mb-10 border-b border-border pb-6">
        <p className="eyebrow text-champagne">Final step</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">
          Complete your details below. We’ll confirm your order and guide you through payment.
        </p>
      </div>
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
