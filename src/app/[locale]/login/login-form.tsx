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
import { loginAction } from "./auth-actions";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
            {state.error ? (
              <p className="text-sm text-destructive">
                {t(`errors.${state.error}`)}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("submitting") : t("loginSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
          {t("registerLink")}
        </Link>
      </p>
    </div>
  );
}
