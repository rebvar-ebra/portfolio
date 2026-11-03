import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "gxb80y9b",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
});
