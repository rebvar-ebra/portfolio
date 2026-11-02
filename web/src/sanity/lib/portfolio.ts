import { getSiteContent, projects as checkedInProjects, type ProjectCopy, type ProjectDefinition, type SiteContent } from "@/content/site";
import { locales, type Locale } from "@/lib/i18n";
import { hasSanityConfig } from "@/sanity/env";

import { portfolioFreshReadWindow } from "./cache-state";
import { sanityClient, sanityFreshClient } from "./client";
import { portfolioQuery } from "./queries";

type UnknownRecord = Record<string, unknown>;

export type PortfolioSource = {
  settings: UnknownRecord | null;
  projects: UnknownRecord[];
};

type PortfolioResult = { content: SiteContent; projects: ProjectDefinition[] };
type SourceLoader = () => Promise<PortfolioSource>;

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const valueOr = (value: unknown, fallback: string) => isString(value) ? value : fallback;
const arrayOr = <T>(value: unknown, fallback: readonly T[]) => Array.isArray(value) ? value as T[] : fallback;
const safeHttpsUrl = (value: unknown) => isString(value) && /^https:\/\/[^\s]+$/i.test(value) ? value : null;
const safeCover = (value: unknown) => isString(value) && (value.startsWith("/project-covers/") || /^https:\/\/cdn\.sanity\.io\//i.test(value)) ? value : null;

const localeKey = (locale: Locale) => locale === "de" ? "german" : "english";

const navigationFor = (locale: Locale, value: unknown, fallback: SiteContent["navigation"]) => {
  if (!isRecord(value)) return fallback;
  const labels = [value.home, value.projects, value.about, value.contact];
  if (!labels.every(isString)) return fallback;
  const paths = ["", "/projects", "/about", "/contact"];
  return labels.map((label, index) => ({ label: label as string, href: `/${locale}${paths[index]}` }));
};

const projectCopy = (raw: UnknownRecord, locale: Locale): ProjectCopy | null => {
  const translation = raw[localeKey(locale)];
  const slug = raw.slug;
  if (!isString(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !isRecord(translation)) return null;

  const required = ["title", "label", "summary", "problem", "role", "solution", "learning"] as const;
  if (!required.every((key) => isString(translation[key])) || !isStringArray(translation.decisions) || !isStringArray(translation.challenges)) return null;

  return {
    slug,
    title: translation.title as string,
    label: translation.label as string,
    summary: translation.summary as string,
    problem: translation.problem as string,
    role: translation.role as string,
    solution: translation.solution as string,
    decisions: translation.decisions,
    challenges: translation.challenges,
    learning: translation.learning as string,
    disclosure: isString(translation.disclosure) ? translation.disclosure : null,
  };
};

const projectDefinition = (raw: UnknownRecord): ProjectDefinition | null => {
  const slug = raw.slug;
  const kind = raw.kind;
  if (!isString(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (kind !== "professional" && kind !== "demo" && kind !== "learning") return null;
  if (!isStringArray(raw.technologies) || raw.technologies.length === 0) return null;

  const fallbackCover = checkedInProjects.find((item) => item.slug === slug)?.coverImage ?? "/project-covers/scan-platform.svg";
  return {
    slug,
    order: typeof raw.order === "number" ? raw.order : 0,
    featured: raw.featured !== false,
    kind,
    technologies: raw.technologies,
    publicSafe: raw.publicSafe === true,
    hasConfidentialSource: raw.hasConfidentialSource === true,
    liveUrl: safeHttpsUrl(raw.liveUrl),
    repositoryUrl: safeHttpsUrl(raw.repositoryUrl),
    coverImage: safeCover(raw.coverImageUrl) ?? fallbackCover,
  };
};

const fallback = (locale: Locale): PortfolioResult => ({ content: getSiteContent(locale), projects: [...checkedInProjects] });

const localizedContent = (
  locale: Locale,
  localized: unknown,
  linkedin: string,
): SiteContent => {
  const base = getSiteContent(locale);
  if (!isRecord(localized)) return { ...base, person: { ...base.person, linkedin } };

  const person = isRecord(localized.person) ? localized.person : {};
  const home = isRecord(localized.home) ? localized.home : {};
  const common = isRecord(localized.common) ? localized.common : {};
  const projectsPage = isRecord(localized.projectsPage) ? localized.projectsPage : {};
  const about = isRecord(localized.about) ? localized.about : {};
  const contact = isRecord(localized.contact) ? localized.contact : {};
  const footer = isRecord(localized.footer) ? localized.footer : {};

  const mappedCommon = Object.fromEntries(
    Object.entries(base.common).map(([key, fallbackValue]) => [key, valueOr(common[key], fallbackValue)]),
  ) as SiteContent["common"];
  const mappedContact = Object.fromEntries(
    Object.entries(base.contact).map(([key, fallbackValue]) => [key, valueOr(contact[key], fallbackValue)]),
  ) as SiteContent["contact"];

  return {
    locale,
    languageName: base.languageName,
    person: {
      ...base.person,
      name: valueOr(person.name, base.person.name) as SiteContent["person"]["name"],
      role: valueOr(person.role, base.person.role),
      location: valueOr(person.location, base.person.location),
      introduction: valueOr(person.introduction, base.person.introduction),
      linkedin,
    },
    navigation: navigationFor(locale, localized.navigation, base.navigation),
    home: {
      headline: valueOr(home.headline, base.home.headline),
      intro: valueOr(home.intro, base.home.intro),
      primaryAction: {
        label: valueOr(home.primaryActionLabel, base.home.primaryAction.label),
        href: `/${locale}/projects`,
      },
      contactAction: {
        label: valueOr(home.contactActionLabel, base.home.contactAction.label),
        href: `/${locale}/contact`,
      },
      approachTitle: valueOr(home.approachTitle, base.home.approachTitle),
      approach: base.home.approach,
      selectedWork: valueOr(home.selectedWork, base.home.selectedWork),
      workLabel: valueOr(home.workLabel, base.home.workLabel),
      methodLabel: valueOr(home.methodLabel, base.home.methodLabel),
      requestPath: base.home.requestPath,
      approachSteps: arrayOr<SiteContent["home"]["approachSteps"][number]>(home.approachSteps, base.home.approachSteps),
    },
    common: mappedCommon,
    projectsPage: {
      label: valueOr(projectsPage.label, base.projectsPage.label),
      title: valueOr(projectsPage.title, base.projectsPage.title),
      intro: valueOr(projectsPage.intro, base.projectsPage.intro),
    },
    about: {
      label: valueOr(about.label, base.about.label),
      title: valueOr(about.title, base.about.title),
      intro: valueOr(about.intro, base.about.intro),
      experienceTitle: valueOr(about.experienceTitle, base.about.experienceTitle),
      educationTitle: valueOr(about.educationTitle, base.about.educationTitle),
      skillsTitle: valueOr(about.skillsTitle, base.about.skillsTitle),
      languagesTitle: valueOr(about.languagesTitle, base.about.languagesTitle),
      certificationsTitle: valueOr(about.certificationsTitle, base.about.certificationsTitle),
      learningTitle: valueOr(about.learningTitle, base.about.learningTitle),
      learning: valueOr(about.learning, base.about.learning),
      experience: arrayOr<SiteContent["about"]["experience"][number]>(about.experience, base.about.experience),
      education: arrayOr<SiteContent["about"]["education"][number]>(about.education, base.about.education),
      languages: arrayOr<SiteContent["about"]["languages"][number]>(about.languages, base.about.languages),
      certifications: arrayOr<SiteContent["about"]["certifications"][number]>(about.certifications, base.about.certifications),
      skills: arrayOr<SiteContent["about"]["skills"][number]>(about.skills, base.about.skills),
    },
    contact: mappedContact,
    projectCopy: [],
    footer: {
      note: valueOr(footer.note, base.footer.note),
      availability: valueOr(footer.availability, base.footer.availability),
    },
  };
};

const mapSource = (source: PortfolioSource, locale: Locale): PortfolioResult => {
  if (!source.settings && source.projects.length === 0) return fallback(locale);

  const slugCounts = new Map<string, number>();
  for (const item of source.projects) {
    if (isString(item.slug)) slugCounts.set(item.slug, (slugCounts.get(item.slug) ?? 0) + 1);
  }

  const mapped = source.projects
    .filter((raw) => !isString(raw.slug) || slugCounts.get(raw.slug) === 1)
    .flatMap((raw) => {
      const definition = projectDefinition(raw);
      const english = projectCopy(raw, "en");
      const german = projectCopy(raw, "de");
      if (!definition || !english || !german) return [];
      return [{ definition, copy: locale === "de" ? german : english }];
    });

  const base = getSiteContent(locale);
  const localized = source.settings?.[localeKey(locale)];
  const linkedin = safeHttpsUrl(source.settings?.linkedin) ?? base.person.linkedin;
  const content = localizedContent(locale, localized, linkedin);
  content.projectCopy = mapped.map(({ copy }) => copy);

  return { content, projects: mapped.map(({ definition }) => definition) };
};

export const createPortfolioRepository = (load: SourceLoader) => {
  const getPortfolio = async (locale: Locale): Promise<PortfolioResult> => {
    try {
      return mapSource(await load(), locale);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") console.warn("Portfolio CMS fallback:", error instanceof Error ? error.name : "UnknownError");
      return fallback(locale);
    }
  };

  return {
    getPortfolio,
    getPortfolioProject: async (locale: Locale, slug: string) => {
      const result = await getPortfolio(locale);
      const definition = result.projects.find((item) => item.slug === slug);
      const copy = result.content.projectCopy.find((item) => item.slug === slug);
      return definition && copy ? { definition, copy, content: result.content } : undefined;
    },
    getPortfolioProjectPaths: async () => {
      const result = await getPortfolio("en");
      return locales.flatMap((locale) => result.projects.map(({ slug }) => ({ locale, slug })));
    },
  };
};

const loadSanityPortfolio: SourceLoader = async () => {
  if (!hasSanityConfig) return { settings: null, projects: [] };
  const client = portfolioFreshReadWindow.shouldBypass() ? sanityFreshClient : sanityClient;
  return client.fetch<PortfolioSource>(portfolioQuery, {}, { next: { revalidate: 60, tags: ["portfolio"] } });
};

const repository = createPortfolioRepository(loadSanityPortfolio);

export const getPortfolio = repository.getPortfolio;
export const getPortfolioProject = repository.getPortfolioProject;
export const getPortfolioProjectPaths = repository.getPortfolioProjectPaths;

