import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Hero } from "./hero-1";

describe("Hero", () => {
  it("renders its localized message and primary destination", () => {
    const markup = renderToStaticMarkup(
      <Hero
        eyebrow="Berlin · Full-Stack Developer"
        title="I turn complex ideas into useful web products."
        subtitle="A dependable product from interface to data model."
        ctaLabel="View projects"
        ctaHref="/en/projects"
      />,
    );

    expect(markup).toContain('id="hero"');
    expect(markup).toContain("Berlin · Full-Stack Developer");
    expect(markup).toContain("I turn complex ideas into useful web products.");
    expect(markup).toContain("A dependable product from interface to data model.");
    expect(markup).toContain('href="/en/projects"');
    expect(markup).toContain("View projects");
  });
});
