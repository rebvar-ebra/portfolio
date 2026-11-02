import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getSiteContent } from "@/content/site";
import { ProjectList } from "./project-list";

describe("ProjectList", () => {
  it("renders each case study as a visual card with a real localized destination", () => {
    const markup = renderToStaticMarkup(<ProjectList content={getSiteContent("en")} />);

    expect(markup.match(/data-slot="notched-project-card"/g)).toHaveLength(4);
    expect(markup).toContain('href="/en/projects/bunex-smashburger"');
    expect(markup).toContain('src="/project-covers/bunex-smashburger.svg"');
    expect(markup).toContain("BUNEX Smashburger");
    expect(markup).toContain('href="/en/projects/3d-scan-platform"');
    expect(markup).toContain('src="/project-covers/scan-platform.svg"');
    expect(markup).toContain("3D Scan Platform");
    expect(markup).toContain("React");
    expect(markup).toContain('href="/en/projects/neuer-tag-ev"');
    expect(markup).toContain('src="/project-covers/neuer-tag-ev.svg"');
    expect(markup).not.toContain("go-ecommerce");
  });
});
