import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AboutPage from "./page";

describe("AboutPage", () => {
  it("presents the CV-backed experience, education, languages, and certifications", async () => {
    const markup = renderToStaticMarkup(await AboutPage({ params: Promise.resolve({ locale: "en" }) }));

    expect(markup).toContain("Think3ddd");
    expect(markup).toContain("KJFE-Schabracke");
    expect(markup).toContain("AI-nergy");
    expect(markup).toContain("University of Szeged");
    expect(markup).toContain("Kurdish");
    expect(markup).toContain("DevOps on AWS: Code, Build, and Test");
  });
});
