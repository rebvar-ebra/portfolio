import { defineArrayMember, defineField, defineType } from "sanity";

import { requiredString, requiredText, stringList } from "./localized";

const linkLabelFields = [
  requiredString("home", "Home"),
  requiredString("projects", "Projects"),
  requiredString("about", "About"),
  requiredString("contact", "Contact"),
];

const commonFields = [
  "viewProject",
  "technologies",
  "detailsNeeded",
  "demoLabel",
  "backToProjects",
  "skipToContent",
  "menu",
  "closeMenu",
  "problem",
  "role",
  "solution",
  "decisions",
  "challenges",
  "learned",
  "liveDemo",
  "sourceUnavailable",
  "typeLabel",
  "linksLabel",
].map((name) => requiredString(name, name.replace(/([A-Z])/g, " $1")));

const contactFields = [
  requiredString("label", "Section label"),
  requiredString("title", "Title"),
  requiredText("intro", "Introduction"),
  requiredString("formTitle", "Form title"),
  requiredString("nameLabel", "Name label"),
  requiredString("emailLabel", "Email label"),
  requiredString("subjectLabel", "Subject label"),
  requiredString("messageLabel", "Message label"),
  requiredString("consentLabel", "Consent label"),
  requiredString("submitLabel", "Submit label"),
  requiredString("submittingLabel", "Submitting label"),
  requiredString("successMessage", "Success message"),
  requiredString("errorMessage", "Error message"),
  requiredString("uncertainMessage", "Uncertain delivery message"),
  requiredString("linkedinLabel", "LinkedIn label"),
  requiredText("note", "Privacy note"),
];

const portfolioLocaleContent = defineType({
  name: "portfolioLocaleContent",
  title: "Portfolio locale content",
  type: "object",
  fields: [
    defineField({
      name: "person",
      title: "Public profile",
      type: "object",
      fields: [
        requiredString("name", "Name"),
        requiredString("role", "Role"),
        requiredString("location", "Location"),
        requiredText("introduction", "Introduction"),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "navigation", title: "Navigation labels", type: "object", fields: linkLabelFields, validation: (rule) => rule.required() }),
    defineField({
      name: "home",
      title: "Home page",
      type: "object",
      fields: [
        requiredString("headline", "Headline"),
        requiredText("intro", "Introduction"),
        requiredString("primaryActionLabel", "Primary action label"),
        requiredString("contactActionLabel", "Contact action label"),
        requiredString("approachTitle", "Approach title"),
        requiredString("selectedWork", "Selected work title"),
        requiredString("workLabel", "Work label"),
        requiredString("methodLabel", "Method label"),
        defineField({
          name: "approachSteps",
          title: "Approach steps",
          type: "array",
          of: [defineArrayMember({
            type: "object",
            fields: [requiredString("phase", "Phase"), requiredString("title", "Title"), requiredText("body", "Body")],
          })],
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "common", title: "Shared labels", type: "object", fields: commonFields, validation: (rule) => rule.required() }),
    defineField({
      name: "projectsPage",
      title: "Projects page",
      type: "object",
      fields: [requiredString("label", "Section label"), requiredString("title", "Title"), requiredText("intro", "Introduction")],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "about",
      title: "About page",
      type: "object",
      fields: [
        requiredString("label", "Section label"), requiredString("title", "Title"), requiredText("intro", "Introduction"),
        requiredString("experienceTitle", "Experience title"), requiredString("educationTitle", "Education title"),
        requiredString("skillsTitle", "Skills title"), requiredString("languagesTitle", "Languages title"),
        requiredString("certificationsTitle", "Certifications title"), requiredString("learningTitle", "Learning title"),
        requiredText("learning", "Learning text"),
        defineField({ name: "experience", title: "Experience", type: "array", of: [defineArrayMember({ type: "object", fields: [requiredString("role", "Role"), requiredString("company", "Company"), requiredString("period", "Period"), requiredString("location", "Location"), stringList("highlights", "Highlights")] })], validation: (rule) => rule.required() }),
        defineField({ name: "education", title: "Education", type: "array", of: [defineArrayMember({ type: "object", fields: [requiredString("degree", "Degree"), requiredString("institution", "Institution"), requiredString("period", "Period"), requiredString("location", "Location"), defineField({ name: "detail", title: "Detail", type: "text" })] })], validation: (rule) => rule.required() }),
        defineField({ name: "languages", title: "Languages", type: "array", of: [defineArrayMember({ type: "object", fields: [requiredString("name", "Language"), requiredString("level", "Level"), defineField({ name: "proficiency", title: "Proficiency", type: "string", options: { list: ["Native", "C1", "B2"] }, validation: (rule) => rule.required() })] })], validation: (rule) => rule.required() }),
        defineField({ name: "certifications", title: "Certifications", type: "array", of: [defineArrayMember({ type: "object", fields: [requiredString("name", "Name"), defineField({ name: "href", title: "HTTPS URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["https"] }) })] })], validation: (rule) => rule.required() }),
        defineField({ name: "skills", title: "Skills", type: "array", of: [defineArrayMember({ type: "object", fields: [requiredString("group", "Group"), stringList("items", "Items")] })], validation: (rule) => rule.required() }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "contact", title: "Contact page", type: "object", fields: contactFields, validation: (rule) => rule.required() }),
    defineField({ name: "footer", title: "Footer", type: "object", fields: [requiredString("note", "Note"), requiredString("availability", "Availability")], validation: (rule) => rule.required() }),
  ],
});

export const portfolioSiteSettings = defineType({
  name: "portfolioSiteSettings",
  title: "Portfolio site settings",
  type: "document",
  fields: [
    defineField({ name: "linkedin", title: "LinkedIn HTTPS URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "english", title: "English", type: "portfolioLocaleContent", validation: (rule) => rule.required() }),
    defineField({ name: "german", title: "Deutsch", type: "portfolioLocaleContent", validation: (rule) => rule.required() }),
  ],
  preview: { prepare: () => ({ title: "Portfolio site settings" }) },
});

export const portfolioSiteTypes = [portfolioLocaleContent, portfolioSiteSettings];

