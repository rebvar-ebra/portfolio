"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NotchedProjectCardProps {
  href: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  badge?: string;
  tags?: readonly string[];
  screen?: { src: string; alt: string; className?: string };
  dim?: number;
  monochrome?: boolean;
  surface?: string;
  accent?: string;
  accentForeground?: string;
  className?: string;
}

const DISC = 64;
const BLOCK = 80;
const FILLET = 28;

export function NotchedProjectCard({
  href,
  title,
  description,
  image,
  imageAlt = "",
  badge,
  tags = [],
  screen,
  dim = screen ? 0.45 : 0,
  monochrome = false,
  surface = "var(--ink)",
  accent = "var(--signal)",
  accentForeground = "var(--ink)",
  className,
}: NotchedProjectCardProps) {
  const tone = monochrome
    ? "grayscale transition-[filter,scale] duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0"
    : "transition-transform duration-500";

  return (
    <Link
      href={href}
      data-slot="notched-project-card"
      className={cn(
        "group flex flex-col rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ink)]",
        className,
      )}
    >
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[var(--panel)]">
          <Image
            fill
            unoptimized
            src={image}
            alt={screen ? "" : imageAlt}
            sizes="(min-width: 900px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover", tone, !screen && "group-hover:scale-[1.04]")}
          />
          {dim > 0 ? (
            <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: `rgb(0 0 0 / ${dim})` }} />
          ) : null}
          {screen ? (
            <Image
              width={1200}
              height={900}
              unoptimized
              src={screen.src}
              alt={screen.alt}
              className={cn(
                "absolute right-0 bottom-0 w-[82%] origin-bottom-right drop-shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.07]",
                tone,
                screen.className,
              )}
            />
          ) : null}
          {badge ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-4">
              <span className="rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                {badge}
              </span>
            </div>
          ) : null}
        </div>

        <div
          aria-hidden="true"
          className="absolute right-0 bottom-0"
          style={{ width: BLOCK, height: BLOCK, borderTopLeftRadius: BLOCK - DISC / 2, background: surface }}
        />
        {[
          { bottom: BLOCK, right: 0 },
          { bottom: 0, right: BLOCK },
        ].map((position, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="absolute"
            style={{
              ...position,
              width: FILLET,
              height: FILLET,
              background: `radial-gradient(circle at top left, transparent ${FILLET - 0.5}px, ${surface} ${FILLET}px)`,
            }}
          />
        ))}

        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-[var(--panel-raised)] text-[var(--paper)] transition-[background-color,color,scale] duration-300 group-hover:scale-105 group-hover:bg-[var(--card-accent)] group-hover:text-[var(--card-accent-fg)]"
          style={
            {
              width: DISC,
              height: DISC,
              "--card-accent": accent,
              "--card-accent-fg": accentForeground,
            } as React.CSSProperties
          }
        >
          <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-medium tracking-[-0.025em] text-[var(--paper)]">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p> : null}
      {tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
          {tags.map((tag) => (
            <li key={tag} className="rounded-md bg-[var(--panel)] px-2 py-1 text-[10px] font-semibold tracking-wide text-[var(--trace)]">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}

export default NotchedProjectCard;
