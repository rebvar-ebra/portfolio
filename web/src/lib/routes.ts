import {
  getProjectCopy,
  getProjectDefinition,
  projects,
} from "@/content/site";
import { locales, type Locale } from "@/lib/i18n";

export const getLocalizedProjectPaths = () =>
  locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );

export const getProjectPageData = (locale: Locale, slug: string) => {
  const definition = getProjectDefinition(slug);
  const copy = getProjectCopy(locale, slug);

  if (!definition || !copy) {
    return undefined;
  }

  return { definition, copy };
};

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
