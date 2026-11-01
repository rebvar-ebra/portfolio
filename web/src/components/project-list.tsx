import { projects, type SiteContent } from "@/content/site";
import { NotchedProjectCard } from "@/components/ui/notched-project-card";

export function ProjectList({ content, limit }: { content: SiteContent; limit?: number }) {
  const visibleProjects = limit ? projects.slice(0, limit) : projects;

  return (
    <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {visibleProjects.map((definition) => {
        const copy = content.projectCopy.find((item) => item.slug === definition.slug);
        if (!copy) return null;

        return (
          <NotchedProjectCard
            key={definition.slug}
            href={`/${content.locale}/projects/${definition.slug}`}
            title={copy.title}
            description={copy.summary}
            image={definition.coverImage}
            badge={copy.label}
            tags={definition.technologies}
            monochrome
          />
        );
      })}
    </div>
  );
}
