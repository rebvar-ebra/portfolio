import { notFound } from "next/navigation";

import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";

type AboutPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getSiteContent(locale);
  return createLocalizedMetadata(locale, "/about", content.about.title, content.about.intro);
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">{content.about.label}</span><div className="page-heading-copy"><h1>{content.about.title}</h1><p>{content.about.intro}</p></div></header>

      <section className="experience-section" aria-labelledby="experience-title">
        <div className="section-heading"><span className="section-label">CV</span><h2 id="experience-title">{content.about.experienceTitle}</h2></div>
        <div className="experience-list">
          {content.about.experience.map((entry) => (
            <article className="experience-entry" key={`${entry.company}-${entry.period}`}>
              <div className="experience-meta"><span>{entry.period}</span><span>{entry.location}</span></div>
              <div className="experience-copy"><h3>{entry.role}</h3><p className="experience-company">{entry.company}</p><ul>{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
            </article>
          ))}
        </div>
      </section>

      <div className="content-grid">
        <section className="content-panel"><h2>{content.about.educationTitle}</h2>{content.about.education.map((entry) => <article className="qualification" key={`${entry.degree}-${entry.institution}`}><h3>{entry.degree}</h3><p><strong>{entry.institution}</strong><br />{entry.period} · {entry.location}</p>{entry.detail ? <p>{entry.detail}</p> : null}</article>)}</section>
        <section className="content-panel"><h2>{content.about.skillsTitle}</h2>{content.about.skills.map((group) => <div key={group.group}><h3>{group.group}</h3><p>{group.items.join(", ")}</p></div>)}</section>
        <section className="content-panel"><h2>{content.about.languagesTitle}</h2><dl className="language-list">{content.about.languages.map((language) => <div key={language.name}><dt>{language.name}</dt><dd>{language.level}</dd></div>)}</dl></section>
        <section className="content-panel"><h2>{content.about.certificationsTitle}</h2><ul className="certificate-list">{content.about.certifications.map((certificate) => <li key={certificate.href}><a className="text-link" href={certificate.href} target="_blank" rel="noreferrer">{certificate.name}</a></li>)}</ul></section>
        <section className="content-panel"><h2>{content.about.learningTitle}</h2><p>{content.about.learning}</p></section>
      </div>
    </div>
  );
}
