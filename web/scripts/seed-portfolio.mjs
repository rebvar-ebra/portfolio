import { getCliClient } from "sanity/cli";

import { getSiteContent, projects } from "../src/content/site.ts";

const isDryRun = process.argv.includes("--dry-run");

const contactCopy = {
  en: {
    formTitle: "Send a message",
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    consentLabel: "I agree that my details may be used to answer this message.",
    submitLabel: "Send message",
    submittingLabel: "Sending…",
    successMessage: "Thanks — your message has been sent.",
    errorMessage: "The message could not be sent. Please try again in a moment.",
    uncertainMessage: "Delivery could not be confirmed. Please wait before trying again.",
    linkedinLabel: "LinkedIn",
    note: "Your details are used only to answer your message and are delivered through a secure email provider.",
  },
  de: {
    formTitle: "Nachricht senden",
    nameLabel: "Name",
    emailLabel: "E-Mail",
    subjectLabel: "Betreff",
    messageLabel: "Nachricht",
    consentLabel: "Ich stimme zu, dass meine Angaben zur Beantwortung dieser Nachricht verwendet werden.",
    submitLabel: "Nachricht senden",
    submittingLabel: "Wird gesendet…",
    successMessage: "Danke — deine Nachricht wurde gesendet.",
    errorMessage: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es gleich noch einmal.",
    uncertainMessage: "Die Zustellung konnte nicht bestätigt werden. Bitte warte vor einem neuen Versuch.",
    linkedinLabel: "LinkedIn",
    note: "Deine Angaben werden nur zur Beantwortung deiner Nachricht verwendet und über einen sicheren E-Mail-Anbieter zugestellt.",
  },
};

const localeDocument = (locale) => {
  const content = getSiteContent(locale);
  const navigation = Object.fromEntries(
    ["home", "projects", "about", "contact"].map((key, index) => [key, content.navigation[index].label]),
  );

  return {
    person: {
      name: content.person.name,
      role: content.person.role,
      location: content.person.location,
      introduction: content.person.introduction,
    },
    navigation,
    home: {
      headline: content.home.headline,
      intro: content.home.intro,
      primaryActionLabel: content.home.primaryAction.label,
      contactActionLabel: content.home.contactAction.label,
      approachTitle: content.home.approachTitle,
      selectedWork: content.home.selectedWork,
      workLabel: content.home.workLabel,
      methodLabel: content.home.methodLabel,
      approachSteps: content.home.approachSteps,
    },
    common: content.common,
    projectsPage: content.projectsPage,
    about: content.about,
    contact: {
      label: content.contact.label,
      title: content.contact.title,
      intro: locale === "en"
        ? "Use the form to tell me about the role, project, or problem you would like to discuss."
        : "Nutze das Formular, um mir von der Stelle, dem Projekt oder der Aufgabe zu erzählen, die du besprechen möchtest.",
      ...contactCopy[locale],
    },
    footer: content.footer,
  };
};

const contentByLocale = {
  en: getSiteContent("en"),
  de: getSiteContent("de"),
};

const documents = [
  {
    _id: "portfolio.siteSettings",
    _type: "portfolioSiteSettings",
    linkedin: contentByLocale.en.person.linkedin,
    english: localeDocument("en"),
    german: localeDocument("de"),
  },
  ...projects.map((project) => {
    const english = contentByLocale.en.projectCopy.find(({ slug }) => slug === project.slug);
    const german = contentByLocale.de.projectCopy.find(({ slug }) => slug === project.slug);

    if (!english || !german) throw new Error(`Missing project copy for ${project.slug}`);

    const englishCopy = Object.fromEntries(Object.entries(english).filter(([key]) => key !== "slug"));
    const germanCopy = Object.fromEntries(Object.entries(german).filter(([key]) => key !== "slug"));

    return {
      _id: `portfolio.project.${project.slug}`,
      _type: "portfolioProject",
      slug: { _type: "slug", current: project.slug },
      order: project.order,
      featured: project.featured,
      publicSafe: project.publicSafe,
      kind: project.kind,
      technologies: [...project.technologies],
      liveUrl: project.liveUrl ?? undefined,
      repositoryUrl: project.repositoryUrl ?? undefined,
      hasConfidentialSource: project.hasConfidentialSource,
      coverImagePath: project.coverImage,
      english: englishCopy,
      german: germanCopy,
    };
  }),
];

if (isDryRun) {
  console.log(JSON.stringify({ mode: "dry-run", count: documents.length, ids: documents.map(({ _id }) => _id) }, null, 2));
} else {
  const client = getCliClient({ apiVersion: "2026-11-02" });
  const results = [];

  for (const document of documents) {
    const result = await client.createIfNotExists(document);
    results.push(result._id);
  }

  console.log(JSON.stringify({ mode: "create-if-absent", count: results.length, ids: results }, null, 2));
}
