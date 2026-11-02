import type { Locale } from "@/lib/i18n";
import { getPortfolioProject, getPortfolioProjectPaths } from "@/sanity/lib/portfolio";

export const getLocalizedProjectPaths = getPortfolioProjectPaths;

export const getProjectPageData = (locale: Locale, slug: string) => getPortfolioProject(locale, slug);

export const replaceLocaleInPath = (pathname: string, locale: Locale) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  segments[0] = locale;
  return `/${segments.join("/")}`;
};

export const getProjectLiveHref = (locale: Locale, liveUrl: string) =>
  /^https?:\/\//.test(liveUrl) ? liveUrl : `/${locale}${liveUrl}`;
