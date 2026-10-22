"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const emptySubscribe = () => () => {};

type StatusPayload = {
  orderStatus: string;
  paymentStatus: string;
};

export function OrderStatusPoller({
  orderNo,
  initial,
}: {
  orderNo: string;
  initial: StatusPayload;
}) {
  const t = useTranslations("Pay");
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [status, setStatus] = useState<StatusPayload>(initial);

  useEffect(() => {
    const terminal = ["PAID", "CANCELLED", "DELIVERED", "FAILED", "EXPIRED"];
    if (terminal.includes(initial.paymentStatus)) return;

    const id = setInterval(() => {
      fetch(`/api/orders/${orderNo}/status`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: StatusPayload | null) => {
          if (data) setStatus(data);
        })
        .catch(() => undefined);
    }, 8000);

    return () => clearInterval(id);
  }, [orderNo, initial.paymentStatus]);

  if (!mounted) {
    return <div className="h-6 w-40 animate-pulse rounded bg-muted" />;
  }

  const paid = status.paymentStatus === "PAID";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`rounded-full px-3 py-1 font-medium ${
          paid
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {t(`paymentStatus.${status.paymentStatus}`)}
      </span>
      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
        {t(`orderStatus.${status.orderStatus}`)}
      </span>
      {!paid ? (
        <span className="text-xs text-muted-foreground">{t("autoRefresh")}</span>
      ) : null}
    </div>
  );
}
