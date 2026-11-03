import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ContactPage from "./page";

describe("ContactPage", () => {
  it("renders the private contact form and LinkedIn without publishing a direct email", async () => {
    const markup = renderToStaticMarkup(await ContactPage({ params: Promise.resolve({ locale: "en" }) }));

    expect(markup).toContain('<form');
    expect(markup).toContain('name="email"');
    expect(markup).toContain('name="message"');
    expect(markup).toContain('href="https://linkedin.com/in/rebvar-ebrahimi"');
    expect(markup).not.toContain("mailto:");
    expect(markup).not.toContain("rebvar.ebrahimy@gmail.com");
    expect(markup).not.toContain('href="tel:');
  });

  it("renders a labelled globe beside the contact form", async () => {
    const markup = renderToStaticMarkup(await ContactPage({ params: Promise.resolve({ locale: "en" }) }));

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Berlin, Germany"');
    expect(markup).toContain('class="contact-globe-country"');
    expect(markup).not.toContain("opacity:0");
  });
});
