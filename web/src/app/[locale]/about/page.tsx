import { notFound } from "next/navigation";

import { getSiteContent } from "@/content/site";
import { isLocale } from "@/lib/i18n";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">Profile</span><div className="page-heading-copy"><h1>{content.about.title}</h1><p>{content.about.intro}</p></div></header>
      <div className="content-grid">
        <section className="content-panel"><h2>{content.about.educationTitle}</h2><p>{content.person.education}</p></section>
        <section className="content-panel"><h2>{content.about.skillsTitle}</h2>{content.about.skills.map((group) => <div key={group.group}><h3>{group.group}</h3><p>{group.items.join(", ")}</p></div>)}</section>
        <section className="content-panel"><h2>{content.about.learningTitle}</h2><p>{content.about.learning}</p></section>
      </div>
    </div>
  );
}
