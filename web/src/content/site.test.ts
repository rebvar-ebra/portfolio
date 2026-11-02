import { describe, expect, it } from "vitest";

import { getSiteContent, projects } from "./site";
import { isLocale, parseLocale } from "@/lib/i18n";

describe("locale parsing", () => {
  it("accepts only the supported locale segments", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("rejects an unsupported locale instead of silently falling back", () => {
    expect(parseLocale("de")).toBe("de");
    expect(() => parseLocale("fr")).toThrow("Unsupported locale");
  });
});

describe("portfolio content", () => {
  it.each(["en", "de"] as const)("provides complete %s identity and navigation", (locale) => {
    const content = getSiteContent(locale);

    expect(content.person.name).toBe("Rebvar Ebrahimi");
    expect(content.person.role).toBe(locale === "de" ? "Full-Stack-Entwickler" : "Full-Stack Developer");
    expect(content.navigation).toHaveLength(4);
    expect(content.home.primaryAction.href).toBe(`/${locale}/projects`);
    expect(content.navigation.map((item) => item.href)).not.toContain(`/${locale}/lab`);
  });

  it("publishes only CV-verified contact links", () => {
    const content = getSiteContent("en");

    expect(content.person.email).toBe("rebvar.ebrahimy@gmail.com");
    expect(content.person.linkedin).toBe("https://linkedin.com/in/rebvar-ebrahimi");
    expect(content.person.github).toBeNull();
    expect(content.person.resume).toBeNull();
  });

  it.each(["en", "de"] as const)("includes the CV-backed career and qualifications in %s", (locale) => {
    const content = getSiteContent(locale);

    expect(content.about.experience).toHaveLength(3);
    expect(content.about.experience[0].company).toBe("Think3ddd");
    expect(content.about.education).toHaveLength(2);
    expect(content.about.languages.map((language) => language.proficiency)).toEqual(["Native", "Native", "C1", "B2"]);
    expect(content.about.certifications.map((certificate) => certificate.href)).toEqual([
      "https://www.coursera.org/account/accomplishments/certificate/XQXNFU9UA8TZ",
      "https://www.coursera.org/account/accomplishments/certificate/GQ8N76YZW2ZM",
    ]);
  });

  it("publishes the professional 3D case study without exposing confidential source", () => {
    const scanProject = projects.find((project) => project.slug === "3d-scan-platform");

    expect(scanProject?.publicSafe).toBe(true);
    expect(scanProject?.hasConfidentialSource).toBe(true);
    expect(scanProject?.liveUrl).toBe("https://www.think3ddd.de/");
  });

  it("keeps the restaurant case study without linking to the removed lab", () => {
    const restaurantProject = projects.find((project) => project.slug === "restaurant-operations");

    expect(restaurantProject?.liveUrl).toBeNull();
  });

  it.each(["en", "de"] as const)("publishes the Neuer Tag case study in %s", (locale) => {
    const definition = projects.find((project) => project.slug === "neuer-tag-ev");
    const copy = getSiteContent(locale).projectCopy.find((project) => project.slug === "neuer-tag-ev");

    expect(definition).toMatchObject({
      kind: "professional",
      liveUrl: "https://neuertag-ev.de/",
      technologies: ["Next.js", "TypeScript", "Sanity", "Vercel"],
    });
    expect(copy?.title).toBe("Neuer Tag e.V.");
  });

  it.each(["en", "de"] as const)("lists Sanity in the %s backend skills", (locale) => {
    const content = getSiteContent(locale);
    const backend = content.about.skills.find((group) =>
      ["Backend", "Backend-Systeme"].includes(group.group),
    );

    expect(backend?.items).toContain("Sanity");
    expect(backend?.items).not.toContain("Go");
  });

  it("localizes the request path and approach labels instead of mixing languages", () => {
    const content = getSiteContent("de");

    expect(content.home.requestPath.title).toBe("Ein sichtbarer Datenfluss");
    expect(content.home.requestPath.nodes[0].title).toBe("Oberfläche");
    expect(content.home.approachSteps[0].title).toBe("Die tatsächliche Aufgabe verstehen");
  });
});
