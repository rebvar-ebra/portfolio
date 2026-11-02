import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProjectsPage from "./page";

describe("ProjectsPage", () => {
  it("renders the localized archive label", async () => {
    const markup = renderToStaticMarkup(await ProjectsPage({ params: Promise.resolve({ locale: "de" }) }));

    expect(markup).toContain("Projektarchiv");
    expect(markup).not.toContain(">Project archive<");
  });
});
