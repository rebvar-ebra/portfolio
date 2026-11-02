import { notFound } from "next/navigation";

import { ContactForm } from "@/components/contact-form";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";
import { getPortfolio } from "@/sanity/lib/portfolio";

type ContactPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getPortfolio(locale);
  return createLocalizedMetadata(locale, "/contact", content.contact.title, content.contact.intro);
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { content } = await getPortfolio(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">{content.contact.label}</span><div className="page-heading-copy"><h1>{content.contact.title}</h1><p>{content.contact.intro}</p></div></header>
      <section className="contact-layout" aria-label={content.contact.label}>
        <div className="contact-panel">
          <span className="section-label">{content.person.location}</span>
          <ContactForm copy={content.contact} />
          <p className="contact-note">{content.contact.note}</p>
        </div>
        <aside className="contact-aside">
          <span className="section-label">{content.contact.linkedinLabel}</span>
          <a href={content.person.linkedin} target="_blank" rel="noreferrer">
            <span>{content.contact.linkedinLabel}</span>
            <strong>linkedin.com/in/rebvar-ebrahimi</strong>
          </a>
        </aside>
      </section>
    </div>
  );
}
