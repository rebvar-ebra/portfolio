import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";
import { getPortfolio } from "@/sanity/lib/portfolio";

type ProjectsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getPortfolio(locale);
  return createLocalizedMetadata(locale, "/projects", content.projectsPage.title, content.projectsPage.intro);
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { content, projects } = await getPortfolio(locale);

  return (
    <div className="page-frame">
      <header className="page-heading">
        <span className="section-label">{content.projectsPage.label}</span>
        <div className="page-heading-copy"><h1>{content.projectsPage.title}</h1><p>{content.projectsPage.intro}</p></div>
      </header>
      <ProjectList content={content} projects={projects} />
    </div>
  );
}
