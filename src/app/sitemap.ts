import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/shop", "/about", "/contact", "/cart", "/wishlist"];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of paths) {
      const url = `${siteUrl}/${locale}${path}`;
      entries.push({
        url,
        changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
      });
    }
  }
  return entries;
}