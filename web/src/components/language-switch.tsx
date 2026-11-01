"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { alternateLocale, type Locale } from "@/lib/i18n";
import { replaceLocaleInPath } from "@/lib/routes";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const nextLocale = alternateLocale(locale);

  return (
    <Link
      className="locale-link"
      href={replaceLocaleInPath(pathname, nextLocale)}
      hrefLang={nextLocale}
      lang={nextLocale}
      aria-label={nextLocale === "de" ? "Auf Deutsch wechseln" : "Switch to English"}
    >
      <span aria-hidden="true" />
      {nextLocale.toUpperCase()}
    </Link>
  );
}
