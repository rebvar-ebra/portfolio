import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ContactPage from "./page";

describe("ContactPage", () => {
  it("renders the CV-verified professional channels without publishing private CV details", async () => {
    const markup = renderToStaticMarkup(await ContactPage({ params: Promise.resolve({ locale: "en" }) }));

    expect(markup).toContain('href="mailto:rebvar.ebrahimy@gmail.com"');
    expect(markup).toContain('href="https://linkedin.com/in/rebvar-ebrahimi"');
    expect(markup).not.toContain('href="tel:');
    expect(markup).toContain("does not publish my phone number or street address");
  });
});
