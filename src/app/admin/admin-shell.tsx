"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/app/[locale]/login/auth-actions";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "./admin-nav";

type Props = {
  userName: string;
  userEmail: string;
  initials: string;
  children: React.ReactNode;
};

export function AdminShell({ userName, userEmail, initials, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const navId = useId();

  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 lg:flex-row">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-foreground -m-2 rounded-md p-2 transition-colors"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link href="/admin" className="font-semibold tracking-tight">
          Perfume Shop
        </Link>
        <Badge variant="secondary">Admin</Badge>
      </header>

      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id={navId}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-background transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden h-14 shrink-0 items-center border-b px-4 lg:flex">
          <Link href="/admin" className="font-semibold tracking-tight">
            Perfume Shop
          </Link>
          <Badge variant="secondary" className="ml-2">
            Admin
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <AdminNav />
        </div>
        <div className="shrink-0 border-t p-4 text-sm">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{userName}</p>
              <p className="text-muted-foreground truncate text-xs">
                {userEmail}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Badge variant="secondary">Admin</Badge>
            <Link
              href="/en"
              className="text-primary whitespace-nowrap hover:underline"
            >
              Storefront
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground whitespace-nowrap hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
