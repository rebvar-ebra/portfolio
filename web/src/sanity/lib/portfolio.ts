import { getSiteContent, projects as checkedInProjects, type ProjectCopy, type ProjectDefinition, type SiteContent } from "@/content/site";
import { locales, type Locale } from "@/lib/i18n";
import { hasSanityConfig } from "@/sanity/env";

import { sanityClient } from "./client";
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

const mapSource = (source: PortfolioSource, locale: Locale): PortfolioResult => {
  if (!source.settings && source.projects.length === 0) return fallback(locale);

  const slugs = source.projects.map((item) => item.slug).filter(isString);
  if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate portfolio project slug");

  const mapped = source.projects
    .map((raw) => ({ definition: projectDefinition(raw), copy: projectCopy(raw, locale) }))
    .filter((item): item is { definition: ProjectDefinition; copy: ProjectCopy } => Boolean(item.definition && item.copy));

  const base = getSiteContent(locale);
  const localized = source.settings?.[localeKey(locale)];
  const cms = isRecord(localized) ? localized : null;
  const cmsPerson = cms && isRecord(cms.person) ? cms.person : null;
  const linkedin = safeHttpsUrl(source.settings?.linkedin) ?? base.person.linkedin;

  const content: SiteContent = {
    ...base,
    ...(cms ?? {}),
    locale,
    person: { ...base.person, ...(cmsPerson ?? {}), linkedin },
    navigation: navigationFor(locale, cms?.navigation, base.navigation),
    projectCopy: mapped.map(({ copy }) => copy),
  } as SiteContent;

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
  return sanityClient.fetch<PortfolioSource>(portfolioQuery, {}, { next: { revalidate: 60, tags: ["portfolio"] } });
};

const repository = createPortfolioRepository(loadSanityPortfolio);

export const getPortfolio = repository.getPortfolio;
export const getPortfolioProject = repository.getPortfolioProject;
export const getPortfolioProjectPaths = repository.getPortfolioProjectPaths;

