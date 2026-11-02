import { describe, expect, it } from "vitest";

import {
  getLocalizedProjectPaths,
  getProjectLiveHref,
  getProjectPageData,
  replaceLocaleInPath,
} from "./routes";

describe("localized portfolio routes", () => {
  it("generates one project path per locale and public project", async () => {
    await expect(getLocalizedProjectPaths()).resolves.toEqual([
      { locale: "en", slug: "bunex-smashburger" },
      { locale: "en", slug: "3d-scan-platform" },
      { locale: "en", slug: "restaurant-operations" },
      { locale: "en", slug: "neuer-tag-ev" },
      { locale: "de", slug: "bunex-smashburger" },
      { locale: "de", slug: "3d-scan-platform" },
      { locale: "de", slug: "restaurant-operations" },
      { locale: "de", slug: "neuer-tag-ev" },
    ]);
  });

  it("joins project definition, localized copy, and page content for a valid route", async () => {
    const pageData = await getProjectPageData("de", "restaurant-operations");

    expect(pageData?.definition.kind).toBe("demo");
    expect(pageData?.copy.title).toBe("Restaurant Operations Demo");
    expect(pageData?.content.locale).toBe("de");
  });

  it("returns undefined for unknown project slugs", async () => {
    await expect(getProjectPageData("en", "invented-project")).resolves.toBeUndefined();
  });

  it("switches only the locale segment while preserving a nested path", () => {
    expect(replaceLocaleInPath("/en/projects/restaurant-operations", "de")).toBe(
      "/de/projects/restaurant-operations",
    );
    expect(replaceLocaleInPath("/en", "de")).toBe("/de");
  });

  it("keeps external project links absolute while localizing internal links", () => {
    expect(getProjectLiveHref("en", "https://neuertag-ev.de/")).toBe("https://neuertag-ev.de/");
    expect(getProjectLiveHref("de", "/projects/demo")).toBe("/de/projects/demo");
  });
});
