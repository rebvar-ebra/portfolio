import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { RequestPath } from "@/components/request-path";
import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
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
        <RequestPath />
      </section>

      <section className="section" aria-labelledby="selected-work">
        <div className="section-heading">
          <span className="section-label">Work index</span>
          <h2 id="selected-work">{content.home.selectedWork}</h2>
        </div>
        <ProjectList content={content} />
      </section>

      <section className="section" aria-labelledby="approach-title">
        <div className="section-heading">
          <span className="section-label">Method</span>
          <h2 id="approach-title">{content.home.approachTitle}</h2>
        </div>
        <div className="approach-grid">
          <article className="approach-step"><span>Input</span><h3>Understand the real job</h3><p>{content.home.approach}</p></article>
          <article className="approach-step"><span>Flow</span><h3>Make the system legible</h3><p>{content.person.introduction}</p></article>
          <article className="approach-step"><span>Proof</span><h3>Test the path that matters</h3><p>{content.lab.intro}</p></article>
        </div>
      </section>
    </div>
  );
}
