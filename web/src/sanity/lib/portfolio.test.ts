import { describe, expect, it } from "vitest";

import { getSiteContent, projects as fallbackProjects } from "@/content/site";

import { createPortfolioRepository, type PortfolioSource } from "./portfolio";

const localeDocument = (locale: "en" | "de") => {
  const fallback = getSiteContent(locale);
  // The omitted fields are reconstructed below or intentionally excluded from the CMS settings shape.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale: _locale, navigation, projectCopy: _projectCopy, ...content } = fallback;

  return {
    ...content,
    navigation: {
      home: navigation[0].label,
      projects: navigation[1].label,
      about: navigation[2].label,
      contact: navigation[3].label,
    },
  };
};

const settings = (overrides: Record<string, unknown> = {}) => ({
  linkedin: "https://linkedin.com/in/rebvar-ebrahimi",
  english: localeDocument("en"),
  german: localeDocument("de"),
  ...overrides,
});

const project = (overrides: Record<string, unknown> = {}) => ({
  slug: "cms-project",
  order: 1,
  featured: true,
  kind: "professional",
  technologies: ["Next.js"],
  publicSafe: true,
  hasConfidentialSource: false,
  liveUrl: "https://example.com/",
  repositoryUrl: null,
  coverImageUrl: "/project-covers/scan-platform.svg",
  english: {
    title: "CMS Project",
    label: "Published work",
    summary: "English summary",
    problem: "Problem",
    role: "Role",
    solution: "Solution",
    decisions: ["Decision"],
    challenges: ["Challenge"],
    learning: "Learning",
    disclosure: null,
  },
  german: {
    title: "CMS-Projekt",
    label: "Veröffentlichte Arbeit",
    summary: "Deutsche Zusammenfassung",
    problem: "Problem",
    role: "Rolle",
    solution: "Lösung",
    decisions: ["Entscheidung"],
    challenges: ["Herausforderung"],
    learning: "Erkenntnis",
    disclosure: null,
  },
  ...overrides,
});

const source = (value: PortfolioSource | Error) => async () => {
  if (value instanceof Error) throw value;
  return value;
};

describe("createPortfolioRepository", () => {
  it("uses the complete checked-in fallback when Sanity is unavailable", async () => {
    const repository = createPortfolioRepository(source(new Error("offline")));

    const result = await repository.getPortfolio("en");

    expect(result.projects.map(({ slug }) => slug)).toEqual(fallbackProjects.map(({ slug }) => slug));
    expect(result.content.home.headline).toBe("I turn complex ideas into useful web products.");
  });

  it("uses the complete fallback when the portfolio dataset is uninitialized", async () => {
    const repository = createPortfolioRepository(source({ settings: null, projects: [] }));

    const result = await repository.getPortfolio("de");

    expect(result.projects).toHaveLength(4);
  });

  it("treats CMS project membership as authoritative", async () => {
    const repository = createPortfolioRepository(source({ settings: settings(), projects: [project()] }));

    const result = await repository.getPortfolio("en");

    expect(result.projects.map(({ slug }) => slug)).toEqual(["cms-project"]);
    expect(result.content.projectCopy.map(({ slug }) => slug)).toEqual(["cms-project"]);
  });

  it("preserves intentional empty localized arrays", async () => {
    const english = { ...project().english, decisions: [], challenges: [] };
    const repository = createPortfolioRepository(source({ settings: settings(), projects: [project({ english })] }));

    const result = await repository.getPortfolio("en");

    expect(result.content.projectCopy[0].decisions).toEqual([]);
    expect(result.content.projectCopy[0].challenges).toEqual([]);
  });

  it("removes non-HTTPS editable project links", async () => {
    const repository = createPortfolioRepository(source({
      settings: settings(),
      projects: [project({ liveUrl: "javascript:alert(1)", repositoryUrl: "http://example.com" })],
    }));

    const result = await repository.getPortfolio("en");

    expect(result.projects[0].liveUrl).toBeNull();
    expect(result.projects[0].repositoryUrl).toBeNull();
  });

  it("rejects duplicate published slugs instead of choosing one", async () => {
    const repository = createPortfolioRepository(source({
      settings: settings(),
      projects: [project(), project({ order: 2, english: { ...project().english, title: "Duplicate" } })],
    }));

    const result = await repository.getPortfolio("en");

    expect(result.projects).toEqual([]);
    expect(result.content.projectCopy).toEqual([]);
  });

  it("excludes a project from both locales when either translation is incomplete", async () => {
    const incompleteGerman = { ...project().german, summary: undefined };
    const repository = createPortfolioRepository(source({
      settings: settings(),
      projects: [project({ german: incompleteGerman })],
    }));

    expect((await repository.getPortfolio("en")).projects).toEqual([]);
    expect((await repository.getPortfolio("de")).projects).toEqual([]);
  });

  it("maps the seed-shaped home document into presentation actions", async () => {
    const english = localeDocument("en");
    english.home = {
      headline: "CMS headline",
      intro: "CMS introduction",
      primaryActionLabel: "Explore projects",
      contactActionLabel: "Write to me",
      approachTitle: "CMS approach",
      selectedWork: "CMS work",
      workLabel: "CMS work label",
      methodLabel: "CMS method label",
      approachSteps: [],
    } as unknown as typeof english.home;
    const repository = createPortfolioRepository(source({ settings: settings({ english }), projects: [project()] }));

    const result = await repository.getPortfolio("en");

    expect(result.content.home.primaryAction).toEqual({ label: "Explore projects", href: "/en/projects" });
    expect(result.content.home.contactAction).toEqual({ label: "Write to me", href: "/en/contact" });
    expect(result.content.home.approachSteps).toEqual([]);
  });

  it("maps the requested locale and keeps generated navigation routes", async () => {
    const german = localeDocument("de");
    german.home = { ...german.home, headline: "Dynamischer deutscher Titel" };
    const repository = createPortfolioRepository(source({ settings: settings({ german }), projects: [project()] }));

    const result = await repository.getPortfolio("de");

    expect(result.content.home.headline).toBe("Dynamischer deutscher Titel");
    expect(result.content.navigation[1]).toEqual({ label: "Projekte", href: "/de/projects" });
    expect(result.content.projectCopy[0].title).toBe("CMS-Projekt");
  });
});

