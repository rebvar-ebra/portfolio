import { defineField, defineType } from "sanity";

import { requiredString, requiredText, stringList } from "./localized";

const projectLocale = defineType({
  name: "portfolioProjectLocale",
  title: "Project translation",
  type: "object",
  fields: [
    requiredString("title", "Title"), requiredString("label", "Label"), requiredText("summary", "Summary"),
    requiredText("problem", "Problem"), requiredText("role", "Role and contribution"), requiredText("solution", "Solution"),
    stringList("decisions", "Technical decisions"), stringList("challenges", "Challenges"), requiredText("learning", "Learning"),
    defineField({ name: "disclosure", title: "Disclosure", type: "text", rows: 2 }),
  ],
});

export const portfolioProject = defineType({
  name: "portfolioProject",
  title: "Portfolio project",
  type: "document",
  fields: [
    defineField({ name: "slug", title: "Shared slug", type: "slug", options: { source: "english.title", maxLength: 80 }, validation: (rule) => rule.required().custom((value) => value?.current && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ? true : "Use lower-case words separated by hyphens") }),
    defineField({ name: "order", title: "Order", type: "number", validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: "featured", title: "Featured on home page", type: "boolean", initialValue: true }),
    defineField({ name: "publicSafe", title: "Safe to publish", type: "boolean", initialValue: true, validation: (rule) => rule.required() }),
    defineField({ name: "kind", title: "Kind", type: "string", options: { list: ["professional", "demo", "learning"] }, validation: (rule) => rule.required() }),
    defineField({ name: "technologies", title: "Technologies", type: "array", of: [{ type: "string" }], validation: (rule) => rule.required().min(1) }),
    defineField({ name: "liveUrl", title: "Live HTTPS URL", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
    defineField({ name: "repositoryUrl", title: "Repository HTTPS URL", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
    defineField({ name: "hasConfidentialSource", title: "Source is confidential", type: "boolean", initialValue: false }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "coverImagePath", title: "Fallback public cover path", type: "string", validation: (rule) => rule.custom((value) => !value || value.startsWith("/project-covers/") ? true : "Path must start with /project-covers/") }),
    defineField({ name: "english", title: "English", type: "portfolioProjectLocale", validation: (rule) => rule.required() }),
    defineField({ name: "german", title: "Deutsch", type: "portfolioProjectLocale", validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "english.title", subtitle: "slug.current", media: "coverImage" } },
});

export const portfolioProjectTypes = [projectLocale, portfolioProject];

