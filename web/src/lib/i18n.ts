export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const isLocale = (value: string | undefined): value is Locale =>
  locales.some((locale) => locale === value);

export const parseLocale = (value: string | undefined): Locale => {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale: ${value ?? "missing"}`);
  }

  return value;
};

export const alternateLocale = (locale: Locale): Locale =>
  locale === "en" ? "de" : "en";
