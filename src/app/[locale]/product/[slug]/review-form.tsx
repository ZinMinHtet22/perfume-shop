"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewAction } from "@/app/[locale]/reviews/actions";

type ReviewState = { error: string | null; submitted: boolean };

export function ReviewForm({
  productId,
  locale,
}: {
  productId: string;
  locale: string;
}) {
  const t = useTranslations("Product");
  const router = useRouter();

  const [state, formAction, pending] = useActionState<
    ReviewState,
    FormData
  >(async (_prev, formData) => {
    await submitReviewAction(formData);
    router.refresh();
    return { error: null, submitted: true };
  }, { error: null, submitted: false });

  if (state.submitted) {
    return (
      <p className="rounded-lg border border-green-600/40 bg-green-600/10 p-4 text-sm">
        {t("reviewPending")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="locale" value={locale} />
      <h3 className="font-medium">{t("writeReview")}</h3>
      <div className="space-y-2">
        <Label htmlFor="rating">{t("rating")}</Label>
        <select
          id="rating"
          name="rating"
          required
          defaultValue="5"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-title">{t("reviewTitle")}</Label>
        <Input id="review-title" name="title" maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-comment">{t("reviewComment")}</Label>
        <Textarea
          id="review-comment"
          name="comment"
          required
          rows={3}
          maxLength={2000}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t("reviewSubmitting") : t("reviewSubmit")}
      </Button>
    </form>
  );
}
