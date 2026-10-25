"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** How many recently viewed products we keep for recommendations. */
const MAX_RECENT = 8;

type RecentStore = {
  ids: string[];
  addRecent: (id: string) => void;
};

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      ids: [],
      addRecent: (id) =>
        set((state) => ({
          ids: [id, ...state.ids.filter((x) => x !== id)].slice(0, MAX_RECENT),
        })),
    }),
    { name: "ps_recent_v1" }
  )
);
