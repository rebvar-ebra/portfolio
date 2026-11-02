import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/lib/i18n";
import { getPortfolio } from "@/sanity/lib/portfolio";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getPortfolio(locale);

  return {
    metadataBase: new URL("https://rebvar.xyz"),
    title: { default: `${content.person.name} — ${content.person.role}`, template: `%s — ${content.person.name}` },
    description: content.person.introduction,
    openGraph: {
      title: `${content.person.name} — ${content.person.role}`,
      description: content.person.introduction,
      siteName: "Rebvar Studio",
      locale: locale === "de" ? "de_DE" : "en_GB",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { content } = await getPortfolio(locale);

  return (
    <div className="site-shell" lang={locale}>
      <a className="skip-link" href="#main-content">{content.common.skipToContent}</a>
      <SiteHeader content={content} />
      <main id="main-content">{children}</main>
      <SiteFooter content={content} />
    </div>
  );
}
