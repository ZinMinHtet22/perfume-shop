"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type IntroState = "hidden" | "playing" | "fading" | "gone";

export function IntroSplash() {
  const t = useTranslations();
  const [state, setState] = useState<IntroState>("hidden");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.get("intro") === "1";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const played = sessionStorage.getItem("ps_intro_played") === "1";

    if ((played || reduce) && !force) return;

    sessionStorage.setItem("ps_intro_played", "1");
    document.body.style.overflow = "hidden";

    const playTimer = setTimeout(() => setState("playing"), 50);
    const fadeTimer = setTimeout(() => setState("fading"), 2850);
    const goneTimer = setTimeout(() => {
      document.body.style.overflow = "";
      setState("gone");
    }, 3650);

    return () => {
      clearTimeout(playTimer);
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (state === "hidden" || state === "gone") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0908] transition-opacity duration-700 ${
        state === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.35),transparent_65%)] intro-glow" />

      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.45em] text-[#c9a227] intro-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          {t("Nav.brand")}
        </p>
        <div
          className="h-px bg-gradient-to-r from-transparent via-[#c9a227] to-transparent intro-rule"
          style={{ animationDelay: "0.5s" }}
        />
        <h1
          className="max-w-lg text-3xl font-semibold leading-snug tracking-tight text-[#f4ece1] intro-fade-up sm:text-4xl"
          style={{ animationDelay: "0.7s" }}
        >
          {t("Home.heading")}
        </h1>
        <p
          className="max-w-md text-sm text-[#a89880] intro-fade-up"
          style={{ animationDelay: "1.1s" }}
        >
          {t("Home.tagline")}
        </p>
      </div>
    </div>
  );
}
