"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { SiteContent } from "@/content/site";
import { LanguageSwitch } from "@/components/language-switch";

export function SiteHeader({ content }: { content: SiteContent }) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  }, [pathname]);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <header className="site-header">
      <Link className="brand" href={`/${content.locale}`} aria-label={`${content.person.name} — ${content.navigation[0].label}`}>
        <span className="brand-mark" aria-hidden="true" />
        <span translate="no">Rebvar Studio</span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        {content.navigation.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <LanguageSwitch locale={content.locale} />
      <details className="mobile-menu" ref={mobileMenuRef}>
        <summary role="button" aria-label={content.common.menu}><span aria-hidden="true">≡</span></summary>
        <nav
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as Element).closest("a")) closeMobileMenu();
          }}
        >
          {content.navigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          <LanguageSwitch locale={content.locale} />
        </nav>
      </details>
    </header>
  );
}
