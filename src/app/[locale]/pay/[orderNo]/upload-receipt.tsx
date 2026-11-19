"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadReceiptAction } from "./upload-actions";

export function UploadReceipt({ orderNo }: { orderNo: string }) {
  const t = useTranslations("Pay");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await uploadReceiptAction(formData);
      if (result.error) {
        setMessage({ type: "error", text: t(`uploadErrors.${result.error}`) });
      } else {
        setMessage({ type: "ok", text: t("uploadSuccess") });
        router.refresh();
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6"
    >
      <input type="hidden" name="orderNo" value={orderNo} />
      <h2 className="font-display text-xl text-ivory">{t("uploadTitle")}</h2>
      <p className="text-sm text-ash">{t("uploadNote")}</p>

      <div className="space-y-2">
        <Label htmlFor="bankRef" className="text-ash">
          {t("bankRef")}
        </Label>
        <Input
          id="bankRef"
          name="bankRef"
          maxLength={100}
          className="rounded-[4px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file" className="text-ash">
          {t("receiptFile")}
        </Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="rounded-[4px] file:text-ivory"
        />
      </div>

      {message ? (
        <p
          className={`text-sm ${
            message.type === "ok" ? "text-champagne" : "text-destructive"
          }`}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-[4px] px-6 hover:bg-brass"
      >
        {pending ? t("uploading") : t("uploadButton")}
      </Button>
    </form>
  );
}
