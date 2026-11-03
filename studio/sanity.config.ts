import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./src/schema";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "x34rtnfv";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

export default defineConfig({
  name: "rebvar-portfolio",
  title: "Rebvar Portfolio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Portfolio")
          .items([
            S.listItem()
              .title("Site settings")
              .child(S.document().schemaType("portfolioSiteSettings").documentId("portfolio-site-settings")),
            S.divider(),
            S.documentTypeListItem("portfolioProject").title("Projects"),
          ]),
    }),
    visionTool(),
  ],
});

