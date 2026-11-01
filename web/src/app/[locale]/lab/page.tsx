import { notFound } from "next/navigation";

import { getSiteContent } from "@/content/site";
import { LabDashboard } from "@/features/lab/lab-dashboard";
import { isLocale } from "@/lib/i18n";

export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getSiteContent(locale);

  return (
    <div className="page-frame">
      <header className="page-heading"><span className="section-label">Interactive product lab</span><div className="page-heading-copy"><h1>{content.lab.title}</h1><p>{content.lab.intro}</p></div></header>
      <LabDashboard content={content.lab} />
    </div>
  );
}
