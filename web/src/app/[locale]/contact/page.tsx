import { notFound } from "next/navigation";

import { ContactWithGlobe } from "@/components/ui/contact-with-globe";
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
      <ContactWithGlobe
        label={content.contact.label}
        title={content.contact.title}
        intro={content.contact.intro}
        location={content.person.location}
        linkedinLabel={content.contact.linkedinLabel}
        linkedinUrl={content.person.linkedin}
        note={content.contact.note}
        copy={content.contact}
      />
    </div>
  );
}
