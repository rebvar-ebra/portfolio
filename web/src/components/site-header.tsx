import Link from "next/link";

import type { SiteContent } from "@/content/site";
import { LanguageSwitch } from "@/components/language-switch";

export function SiteHeader({ content }: { content: SiteContent }) {
  return (
    <header className="site-header">
      <Link className="brand" href={`/${content.locale}`} aria-label={`${content.person.name} — ${content.navigation[0].label}`}>
        <span className="brand-mark" aria-hidden="true" />
        Rebvar Studio
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        {content.navigation.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <LanguageSwitch locale={content.locale} />
      <details className="mobile-menu">
        <summary aria-label={content.common.menu}>≡</summary>
        <nav aria-label="Mobile navigation">
          {content.navigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          <LanguageSwitch locale={content.locale} />
        </nav>
      </details>
    </header>
  );
}
