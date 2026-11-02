import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { Hero } from "@/components/ui/hero-1";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";
import { getPortfolio } from "@/sanity/lib/portfolio";

type HomePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getPortfolio(locale);
  return createLocalizedMetadata(locale, "", `${content.person.name} — ${content.person.role}`, content.person.introduction);
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { content, projects } = await getPortfolio(locale);

  return (
    <div className="page-frame home-page">
      <Hero
        eyebrow={`${content.person.location} · ${content.person.role}`}
        title={content.home.headline}
        subtitle={content.home.intro}
        ctaLabel={content.home.primaryAction.label}
        ctaHref={content.home.primaryAction.href}
      />

      <section className="section" aria-labelledby="selected-work">
        <div className="section-heading">
          <span className="section-label">{content.home.workLabel}</span>
          <h2 id="selected-work">{content.home.selectedWork}</h2>
        </div>
        <ProjectList content={content} projects={projects.filter((project) => project.featured)} />
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
