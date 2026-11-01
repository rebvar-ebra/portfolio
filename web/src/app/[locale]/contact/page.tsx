import { notFound } from "next/navigation";

import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";

type ContactPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getSiteContent(locale);
  return createLocalizedMetadata(locale, "/contact", content.contact.title, content.contact.intro);
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">{content.contact.label}</span><div className="page-heading-copy"><h1>{content.contact.title}</h1><p>{content.contact.intro}</p></div></header>
      <section className="contact-panel" aria-labelledby="contact-channels">
        <span className="section-label">{content.person.location}</span>
        <h2 id="contact-channels">{content.contact.directTitle}</h2>
        <div className="contact-methods">
          <a href={`mailto:${content.person.email}`}><span>{content.contact.emailLabel}</span><strong>{content.person.email}</strong></a>
          <a href={content.person.linkedin} target="_blank" rel="noreferrer"><span>{content.contact.linkedinLabel}</span><strong>linkedin.com/in/rebvar-ebrahimi</strong></a>
        </div>
        <p className="contact-note">{content.contact.note}</p>
      </section>
    </div>
  );
}
