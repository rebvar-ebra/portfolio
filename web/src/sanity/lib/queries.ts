import { defineQuery } from "next-sanity";

export const portfolioQuery = defineQuery(`{
  "settings": *[_type == "portfolioSiteSettings" && _id == "portfolio.siteSettings"][0]{
    linkedin,
    english,
    german
  },
  "projects": *[_type == "portfolioProject" && publicSafe == true] | order(order asc){
    "slug": slug.current,
    order,
    featured,
    kind,
    technologies,
    publicSafe,
    hasConfidentialSource,
    liveUrl,
    repositoryUrl,
    "coverImageUrl": coalesce(coverImage.asset->url, coverImagePath),
    english,
    german
  }
}`);

