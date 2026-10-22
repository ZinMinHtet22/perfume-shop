"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadReceiptAction } from "./upload-actions";

export function UploadReceipt({ orderNo }: { orderNo: string }) {
  const t = useTranslations("Pay");
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
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 rounded-lg border p-5">
      <input type="hidden" name="orderNo" value={orderNo} />
      <h2 className="font-medium">{t("uploadTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("uploadNote")}</p>

      <div className="space-y-2">
        <Label htmlFor="bankRef">{t("bankRef")}</Label>
        <Input id="bankRef" name="bankRef" maxLength={100} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">{t("receiptFile")}</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </div>

      {message ? (
        <p
          className={`text-sm ${
            message.type === "ok" ? "text-green-600" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? t("uploading") : t("uploadButton")}
      </Button>
    </form>
  );
}
