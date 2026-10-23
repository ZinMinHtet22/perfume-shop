"use client";

import dynamic from "next/dynamic";

const BottleScene = dynamic(() => import("./bottle-scene"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
  ),
});

export function HeroCanvas() {
  return (
    <div
      className="hero-canvas h-[360px] w-full cursor-grab active:cursor-grabbing sm:h-[440px]"
      aria-hidden
    >
      <BottleScene />
    </div>
  );
}
