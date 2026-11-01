import { notFound } from "next/navigation";

import { ProjectList } from "@/components/project-list";
import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
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
