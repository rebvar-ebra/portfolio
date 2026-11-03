"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schema";

export default defineConfig({
  name: "rebvar-portfolio",
  title: "Rebvar Portfolio",
  basePath: "/studio",
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

