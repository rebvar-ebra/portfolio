import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { RequestPath } from "@/components/request-path";
import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";

type HomePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getSiteContent(locale);
  return createLocalizedMetadata(locale, "", `${content.person.name} — ${content.person.role}`, content.person.introduction);
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <section className="hero">
        <div className="hero-copy">
          <h1>{content.home.headline}</h1>
          <p className="hero-intro">{content.home.intro}</p>
          <div className="actions">
            <Link className="button button-primary" href={content.home.primaryAction.href}>{content.home.primaryAction.label}</Link>
            <Link className="button" href={content.home.demoAction.href}>{content.home.demoAction.label}</Link>
            <Link className="button" href={content.home.contactAction.href}>{content.home.contactAction.label}</Link>
          </div>
        </div>
        <RequestPath content={content.home.requestPath} />
      </section>

      <section className="section" aria-labelledby="selected-work">
        <div className="section-heading">
          <span className="section-label">{content.home.workLabel}</span>
          <h2 id="selected-work">{content.home.selectedWork}</h2>
        </div>
        <ProjectList content={content} />
      </section>

      <section className="section" aria-labelledby="approach-title">
        <div className="section-heading">
          <span className="section-label">{content.home.methodLabel}</span>
          <h2 id="approach-title">{content.home.approachTitle}</h2>
        </div>
        <div className="approach-grid">
          {content.home.approachSteps.map((step) => (
            <article className="approach-step" key={step.phase}><span>{step.phase}</span><h3>{step.title}</h3><p>{step.body}</p></article>
          ))}
        </div>
      </section>
    </div>
  );
}
