"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerAction } from "../login/auth-actions";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(registerAction, {
    error: null,
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-6 py-16 lg:py-24">
      <div className="text-center">
        <p className="eyebrow text-champagne">Account</p>
      </div>
      <Card className="rounded-[4px] border-border bg-surface/30">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-3xl font-normal tracking-[-0.01em] text-ivory">
            {t("registerTitle")}
          </CardTitle>
          <CardDescription className="text-ash">
            {t("registerDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-ash">
                {t("name")}
              </Label>
              <Input
                id="name"
                name="name"
                required
                autoComplete="name"
                className="rounded-[4px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ash">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-[4px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-ash">
                {t("phone")}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="rounded-[4px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-ash">
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-[4px]"
              />
            </div>
            {state.error ? (
              <p className="text-sm text-destructive">
                {t(`errors.${state.error}`)}
              </p>
            ) : null}
            <Button
              type="submit"
              className="h-11 w-full rounded-[4px] hover:bg-brass"
              disabled={pending}
            >
              {pending ? t("submitting") : t("registerSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-ash">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="text-ivory underline decoration-champagne/50 underline-offset-4 transition-colors hover:text-champagne"
        >
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
