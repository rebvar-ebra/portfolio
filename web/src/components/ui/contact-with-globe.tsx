"use client";

import * as d3 from "d3";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";

import { ContactForm, type ContactFormCopy } from "@/components/contact-form";
import { cn } from "@/lib/utils";

const smoothEase = [0.25, 0.1, 0.25, 1] as const;
const BERLIN_ROTATION: [number, number] = [-13.405, -52.52];

type WorldAtlasTopology = Topology<{
  countries: GeometryCollection;
}>;

const atlas = worldAtlas as unknown as WorldAtlasTopology;
const WORLD_COUNTRIES = feature(atlas, atlas.objects.countries).features as GeoJSON.Feature[];
const initialProjection = d3
  .geoOrthographic()
  .fitExtent([[22, 22], [538, 538]], { type: "Sphere" })
  .rotate(BERLIN_ROTATION)
  .precision(0.4);
const initialPath = d3.geoPath(initialProjection);
const INITIAL_GRATICULE_PATH = initialPath(d3.geoGraticule10()) ?? "";
const INITIAL_COUNTRY_PATHS = WORLD_COUNTRIES.map((country) => initialPath(country) ?? "").filter(Boolean);
const INITIAL_OUTLINE_PATH = initialPath({ type: "Sphere" }) ?? "";

function GlobeWireframe({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef<[number, number]>(BERLIN_ROTATION);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [rotation, setRotation] = useState<[number, number]>(BERLIN_ROTATION);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || dragRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastTime = performance.now();
    const rotate = (time: number) => {
      const elapsed = Math.min(time - lastTime, 48);
      lastTime = time;
      setRotation(([longitude, latitude]) => [longitude + elapsed * 0.006, latitude]);
      animationFrame.current = requestAnimationFrame(rotate);
    };
    animationFrame.current = requestAnimationFrame(rotate);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [visible]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = 560;
    const projection = d3
      .geoOrthographic()
      .fitExtent([[22, 22], [width - 22, width - 22]], { type: "Sphere" })
      .rotate(rotation)
      .precision(0.4);
    const path = d3.geoPath(projection);
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    svg
      .append("path")
      .datum(d3.geoGraticule10())
      .attr("class", "contact-globe-graticule")
      .attr("d", path);

    svg
      .selectAll<SVGPathElement, GeoJSON.Feature>(".contact-globe-country")
      .data(WORLD_COUNTRIES)
      .join("path")
      .attr("class", "contact-globe-country")
      .attr("d", (country) => path(country) ?? "");

    svg
      .append("path")
      .datum({ type: "Sphere" } as const)
      .attr("class", "contact-globe-outline")
      .attr("d", path);
  }, [rotation]);

  const beginDrag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const moveDrag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const last = dragRef.current;
    if (!last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setRotation(([longitude, latitude]) => [
      longitude + dx * 0.35,
      Math.max(-80, Math.min(80, latitude - dy * 0.35)),
    ]);
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div ref={containerRef} className="contact-globe-canvas">
      <svg
        ref={svgRef}
        viewBox="0 0 560 560"
        role="img"
        aria-label={label}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <path className="contact-globe-graticule" d={INITIAL_GRATICULE_PATH} />
        {INITIAL_COUNTRY_PATHS.map((pathData, index) => (
          <path className="contact-globe-country" d={pathData} key={index} />
        ))}
        <path className="contact-globe-outline" d={INITIAL_OUTLINE_PATH} />
      </svg>
      <span className="contact-globe-marker" aria-hidden="true" />
    </div>
  );
}

const FormDots = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative
    className={cn("contact-form-dots", className)}
    {...props}
  />
));
FormDots.displayName = "FormDots";

type ContactWithGlobeProps = {
  label: string;
  title: string;
  intro: string;
  location: string;
  linkedinLabel: string;
  linkedinUrl: string;
  note: string;
  copy: ContactFormCopy;
};

export function ContactWithGlobe({
  label,
  title,
  intro,
  location,
  linkedinLabel,
  linkedinUrl,
  note,
  copy,
}: ContactWithGlobeProps) {
  return (
    <section className="contact-globe-section" aria-labelledby="contact-page-title">
      <header className="contact-globe-heading">
        <motion.span
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="section-label"
        >
          {label}
        </motion.span>
        <motion.h1
          id="contact-page-title"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: smoothEase }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: smoothEase }}
        >
          {intro}
        </motion.p>
      </header>

      <div className="contact-globe-layout">
        <motion.aside
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: smoothEase }}
          className="contact-globe-info"
        >
          <div className="contact-globe-location">
            <MapPin aria-hidden="true" />
            <div>
              <span className="section-label">{label}</span>
              <strong>{location}</strong>
            </div>
          </div>
          <GlobeWireframe label={location} />
          <a className="contact-linkedin" href={linkedinUrl} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            <span>{linkedinLabel}</span>
            <ArrowRight aria-hidden="true" />
          </a>
        </motion.aside>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: smoothEase }}
          className="contact-globe-form-card"
        >
          <FormDots />
          <ContactForm copy={copy} />
          <p className="contact-note">{note}</p>
        </motion.div>
      </div>
    </section>
  );
}
