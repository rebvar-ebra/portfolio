import { describe, expect, it } from "vitest";

import { createLocalizedMetadata } from "./metadata";

describe("localized route metadata", () => {
  it("keeps canonical, alternates, and Open Graph URL on the same nested route", () => {
    const metadata = createLocalizedMetadata("en", "/projects", "Projects", "Portfolio projects");

    expect(metadata.alternates?.canonical).toBe("/en/projects");
    expect(metadata.alternates?.languages).toEqual({ en: "/en/projects", de: "/de/projects" });
    expect(metadata.openGraph?.url).toBe("/en/projects");
  });

  it("generates localized case-study paths without collapsing to home", () => {
    const metadata = createLocalizedMetadata("de", "/projects/go-ecommerce", "Go E-Commerce", "Lernprojekt");

    expect(metadata.alternates?.canonical).toBe("/de/projects/go-ecommerce");
    expect(metadata.alternates?.languages).toEqual({
      en: "/en/projects/go-ecommerce",
      de: "/de/projects/go-ecommerce",
    });
  });
});
