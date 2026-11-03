import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "x34rtnfv",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
  deployment: { appId: "k7n39c2kbjqhneby6jam1ko3" },
});
