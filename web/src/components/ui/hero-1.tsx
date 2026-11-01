"use client";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative isolate mx-auto min-h-[calc(100svh-82px)] w-full overflow-hidden rounded-b-xl bg-[linear-gradient(to_bottom,var(--ink),var(--ink)_52%,#17272e_88%,#dbe1df_135%)] px-6 pt-28 text-center md:px-8 md:pt-36"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-[620px] w-full bg-[linear-gradient(to_right,rgba(111,199,194,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,199,194,0.12)_1px,transparent_1px)] bg-[size:6rem_5rem] opacity-80 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      <div
        aria-hidden="true"
        className="hero-fade-up absolute left-1/2 top-[calc(100%-90px)] -z-10 h-[500px] w-[720px] -translate-x-1/2 rounded-[100%] border border-[var(--trace)] bg-[radial-gradient(closest-side,var(--ink)_82%,var(--paper))] opacity-0 md:top-[calc(100%-130px)] md:w-[1100px] lg:top-[calc(100%-160px)] lg:h-[750px] lg:w-[140%]"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        {eyebrow ? (
          <span className="hero-fade-in inline-flex w-fit -translate-y-4 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[linear-gradient(to_top_right,rgba(111,199,194,0.08),rgba(242,240,232,0.04),transparent)] px-5 py-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--trace)] opacity-0">
            {eyebrow}
            <ChevronRight aria-hidden="true" className="ml-2 size-4" strokeWidth={1.8} />
          </span>
        ) : null}

        <h1 className="hero-fade-in max-w-[12ch] -translate-y-4 text-balance bg-gradient-to-br from-[var(--paper)] from-35% to-[rgba(242,240,232,0.38)] bg-clip-text py-7 text-5xl leading-[0.9] font-semibold tracking-[-0.065em] text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl">
          {title}
        </h1>

        <p className="hero-fade-in mb-12 max-w-2xl -translate-y-4 text-balance text-lg tracking-tight text-[var(--muted)] opacity-0 md:text-xl">
          {subtitle}
        </p>

        {ctaLabel ? (
          <div className="hero-fade-in flex justify-center opacity-0">
            <Button asChild size="lg" className="group min-w-52 tracking-tight">
              <a href={ctaHref}>
                {ctaLabel}
                <ChevronRight aria-hidden="true" className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        ) : null}
      </div>

      <div aria-hidden="true" className="relative mt-32 h-24 [perspective:2000px]" />
    </section>
  );
}
