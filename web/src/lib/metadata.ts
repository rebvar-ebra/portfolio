import type { Metadata } from "next";

import type { Locale } from "./i18n";

export const createLocalizedMetadata = (
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata => {
  const canonical = `/${locale}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: `/en${path}`, de: `/de${path}` },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Rebvar Studio",
      locale: locale === "de" ? "de_DE" : "en_GB",
      type: "website",
    },
  };
};
