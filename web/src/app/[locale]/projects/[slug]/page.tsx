import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";
import { getLocalizedProjectPaths, getProjectLiveHref, getProjectPageData } from "@/lib/routes";

type ProjectPageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateStaticParams = getLocalizedProjectPaths;

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const data = await getProjectPageData(locale, slug);
  return data ? createLocalizedMetadata(locale, `/projects/${slug}`, data.copy.title, data.copy.summary) : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = await getProjectPageData(locale, slug);
  if (!data) notFound();
  const { copy, definition, content } = data;

  return (
    <article className="page-frame">
      <Link className="text-link" href={`/${locale}/projects`}>{content.common.backToProjects}</Link>
      <header className="case-study-header">
        <div><span className="section-label">{copy.label}</span><h1>{copy.title}</h1><p>{copy.summary}</p></div>
        <dl className="case-meta">
          <dt>{content.common.technologies}</dt><dd>{definition.technologies.join(", ")}</dd>
          <dt>{content.common.typeLabel}</dt><dd>{copy.label}</dd>
          <dt>{content.common.linksLabel}</dt><dd>{definition.liveUrl ? <Link className="text-link" href={getProjectLiveHref(locale, definition.liveUrl)}>{content.common.liveDemo}</Link> : content.common.sourceUnavailable}</dd>
        </dl>
      </header>
      <div className="case-body">
        <section className="case-section"><h2>{content.common.problem}</h2><p>{copy.problem}</p></section>
        <section className="case-section"><h2>{content.common.role}</h2><p>{copy.role}</p></section>
        <section className="case-section"><h2>{content.common.solution}</h2><p>{copy.solution}</p></section>
        <section className="case-section"><h2>{content.common.decisions}</h2><ul>{copy.decisions.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="case-section"><h2>{content.common.challenges}</h2><ul>{copy.challenges.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="case-section"><h2>{content.common.learned}</h2><p>{copy.learning}</p></section>
        {copy.disclosure ? <p className="disclosure">{copy.disclosure}</p> : null}
      </div>
    </article>
  );
}
