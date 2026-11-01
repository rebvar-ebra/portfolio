import { notFound } from "next/navigation";

import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">Contact</span><div className="page-heading-copy"><h1>{content.contact.title}</h1><p>{content.contact.intro}</p></div></header>
      <section className="placeholder-panel"><span className="section-label">{content.common.detailsNeeded}</span><h2>{content.contact.placeholderTitle}</h2><p>{content.contact.placeholder}</p></section>
    </div>
  );
}
