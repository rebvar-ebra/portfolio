import { describe, expect, it } from "vitest";

import {
  getLocalizedProjectPaths,
  getProjectPageData,
  replaceLocaleInPath,
} from "./routes";

describe("localized portfolio routes", () => {
  it("generates one project path per locale and public project", () => {
    expect(getLocalizedProjectPaths()).toEqual([
      { locale: "en", slug: "3d-scan-platform" },
      { locale: "en", slug: "restaurant-operations" },
      { locale: "en", slug: "go-ecommerce" },
      { locale: "de", slug: "3d-scan-platform" },
      { locale: "de", slug: "restaurant-operations" },
      { locale: "de", slug: "go-ecommerce" },
    ]);
  });

  it("joins project definition and localized copy for a valid route", () => {
    const pageData = getProjectPageData("de", "restaurant-operations");

    expect(pageData?.definition.kind).toBe("demo");
    expect(pageData?.copy.title).toBe("Restaurant Operations Demo");
  });

  it("returns undefined for unknown project slugs", () => {
    expect(getProjectPageData("en", "invented-project")).toBeUndefined();
  });

  it("switches only the locale segment while preserving a nested path", () => {
    expect(replaceLocaleInPath("/en/projects/go-ecommerce", "de")).toBe(
      "/de/projects/go-ecommerce",
    );
    expect(replaceLocaleInPath("/en", "de")).toBe("/de");
  });
});
