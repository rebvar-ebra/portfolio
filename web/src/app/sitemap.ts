import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { getPortfolio } from "@/sanity/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://rebvar.xyz";
  const pages = ["", "/projects", "/about", "/contact"];
  const { projects } = await getPortfolio("en");

  return locales.flatMap((locale) => [
    ...pages.map((page) => ({ url: `${base}/${locale}${page}`, changeFrequency: "monthly" as const, priority: page === "" ? 1 : 0.8 })),
    ...projects.map((project) => ({ url: `${base}/${locale}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ]);
}
