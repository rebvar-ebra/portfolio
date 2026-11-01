import Link from "next/link";

import { projects, type SiteContent } from "@/content/site";

export function ProjectList({ content, limit }: { content: SiteContent; limit?: number }) {
  const visibleProjects = limit ? projects.slice(0, limit) : projects;

  return (
    <div className="project-list">
      {visibleProjects.map((definition) => {
        const copy = content.projectCopy.find((item) => item.slug === definition.slug);
        if (!copy) return null;

        return (
          <article className="project-row" key={definition.slug}>
            <div>
              <span className="project-kicker">{copy.label}</span>
              <p className="tech-list">{definition.technologies.join(" / ")}</p>
            </div>
            <div>
              <h3 className="project-title">{copy.title}</h3>
              <p className="project-summary">{copy.summary}</p>
            </div>
            <div>
              <Link className="text-link" href={`/${content.locale}/projects/${definition.slug}`}>
                {content.common.viewProject}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
