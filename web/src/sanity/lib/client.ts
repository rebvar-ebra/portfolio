import { createClient } from "@sanity/client";

import { apiVersion, dataset, projectId } from "@/sanity/env";

export const sanityClient = createClient({
  apiVersion,
  dataset,
  projectId,
  perspective: "published",
  useCdn: true,
});

export const sanityFreshClient = sanityClient.withConfig({ useCdn: false });

