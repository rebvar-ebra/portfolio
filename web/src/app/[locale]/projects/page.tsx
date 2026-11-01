import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";
import { createLocalizedMetadata } from "@/lib/metadata";

type ProjectsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getSiteContent(locale);
  return createLocalizedMetadata(locale, "/projects", content.projectsPage.title, content.projectsPage.intro);
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading">
        <span className="section-label">Project archive</span>
        <div className="page-heading-copy"><h1>{content.projectsPage.title}</h1><p>{content.projectsPage.intro}</p></div>
      </header>
      <ProjectList content={content} />
    </div>
  );
}
