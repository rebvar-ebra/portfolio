import { defineArrayMember, defineField, defineType } from "sanity";

export const requiredString = (name: string, title: string) =>
  defineField({ name, title, type: "string", validation: (rule) => rule.required() });

export const requiredText = (name: string, title: string) =>
  defineField({ name, title, type: "text", rows: 3, validation: (rule) => rule.required() });

export const stringList = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    validation: (rule) => rule.required(),
  });

export const localePair = (name: string, title: string, ofType: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "en", title: "English", type: ofType, validation: (rule) => rule.required() }),
      defineField({ name: "de", title: "Deutsch", type: ofType, validation: (rule) => rule.required() }),
    ],
    validation: (rule) => rule.required(),
  });

export const localizedString = defineType({
  name: "portfolioLocalizedString",
  title: "Localized string",
  type: "object",
  fields: [requiredString("en", "English"), requiredString("de", "Deutsch")],
});

export const localizedText = defineType({
  name: "portfolioLocalizedText",
  title: "Localized text",
  type: "object",
  fields: [requiredText("en", "English"), requiredText("de", "Deutsch")],
});

