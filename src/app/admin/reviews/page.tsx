import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveReviewAction, deleteReviewAction } from "../actions";

export const instant = false;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; tab?: string }>;
}) {
  await connection();
  const { ok, err, tab } = await searchParams;
  const showPending = tab !== "approved";

  const [pendingCount, approvedCount, reviews] = await Promise.all([
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.review.findMany({
      where: showPending ? { isApproved: false } : { isApproved: true },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const messages: Record<string, string> = {
    approved: "Review approved and published.",
    deleted: "Review deleted.",
    notFound: "Review not found.",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/reviews"
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              showPending
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Pending ({pendingCount})
          </Link>
          <Link
            href="/admin/reviews?tab=approved"
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              !showPending
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Approved ({approvedCount})
          </Link>
        </div>
      </div>

      {ok ? (
        <p className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {messages[ok] ?? "Done."}
        </p>
      ) : null}
      {err ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {messages[err] ?? "Something went wrong."}
        </p>
      ) : null}

      {reviews.length === 0 ? (
        <p className="rounded-lg border py-16 text-center text-muted-foreground">
          {showPending ? "No reviews awaiting moderation." : "No approved reviews."}
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{review.product.name}</span>
                    {" by "}
                    <span className="text-muted-foreground">
                      {review.user.name ?? review.user.email}
                    </span>
                  </p>
                  <p className="text-sm text-[#c9a227]" aria-label={`${review.rating}/5`}>
                    <span aria-hidden="true">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </p>
                  {review.title ? (
                    <p className="font-medium">{review.title}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={review.isApproved ? "default" : "secondary"}>
                    {review.isApproved ? "Approved" : "Pending"}
                  </Badge>
                  {!review.isApproved ? (
                    <form action={approveReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="backTo" value="/admin/reviews" />
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                    </form>
                  ) : null}
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input
                      type="hidden"
                      name="backTo"
                      value={
                        showPending
                          ? "/admin/reviews"
                          : "/admin/reviews?tab=approved"
                      }
                    />
                    <Button type="submit" size="sm" variant="destructive">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
