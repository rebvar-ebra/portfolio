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
    expect(content.navigation).toHaveLength(5);
    expect(content.home.primaryAction.href).toBe(`/${locale}/projects`);
  });

  it("keeps unverified links absent instead of fabricating URLs", () => {
    const content = getSiteContent("en");

    expect(content.person.email).toBeNull();
    expect(content.person.github).toBeNull();
    expect(content.person.linkedin).toBeNull();
    expect(content.person.resume).toBeNull();
  });

  it("marks the Go project as learning work and the 3D case study as reconstructed", () => {
    const goProject = projects.find((project) => project.slug === "go-ecommerce");
    const scanProject = projects.find((project) => project.slug === "3d-scan-platform");

    expect(goProject?.kind).toBe("learning");
    expect(scanProject?.publicSafe).toBe(true);
    expect(scanProject?.hasConfidentialSource).toBe(true);
  });
});
