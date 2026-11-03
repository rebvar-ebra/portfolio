import { getCliClient } from "sanity/cli";

import { getSiteContent, projects } from "../../web/src/content/site.ts";

const isDryRun = process.argv.includes("--dry-run");

const legacyDocumentIds = [
  "portfolio.siteSettings",
  ...projects.map((project) => `portfolio.project.${project.slug}`),
];

const legacyIdByDocumentId = new Map([
  ["portfolio-site-settings", "portfolio.siteSettings"],
  ...projects.map((project) => [
    `portfolio-project-${project.slug}`,
    `portfolio.project.${project.slug}`,
  ]),
]);

const withoutSystemFields = (document, id) => Object.fromEntries([
  ["_id", id],
  ...Object.entries(document).filter(([key]) => !["_id", "_rev", "_createdAt", "_updatedAt"].includes(key)),
]);

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
    // Published documents whose IDs contain dots are hidden from anonymous
    // Content Lake reads. Keep public portfolio IDs path-free.
    _id: "portfolio-site-settings",
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
      _id: `portfolio-project-${project.slug}`,
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
  const allRelevantIds = [
    ...legacyDocumentIds,
    ...legacyDocumentIds.map((id) => `drafts.${id}`),
    ...documents.map(({ _id }) => _id),
    ...documents.map(({ _id }) => `drafts.${_id}`),
  ];
  const existingDocuments = await client.fetch(
    "*[_id in $ids]",
    { ids: allRelevantIds },
    { perspective: "raw" },
  );
  const existingById = new Map(existingDocuments.map((document) => [document._id, document]));
  const removableLegacyIds = [];
  const migration = client.transaction();

  for (const seedDocument of documents) {
    const legacyId = legacyIdByDocumentId.get(seedDocument._id);
    if (!legacyId) throw new Error(`Missing legacy mapping for ${seedDocument._id}`);

    const currentDocument = existingById.get(seedDocument._id);
    const legacyDocument = existingById.get(legacyId);
    const legacyDraft = existingById.get(`drafts.${legacyId}`);
    const currentDraft = existingById.get(`drafts.${seedDocument._id}`);

    for (const candidate of [currentDocument, legacyDocument, legacyDraft, currentDraft]) {
      if (candidate && candidate._type !== seedDocument._type) {
        throw new Error(`Refusing to migrate ${candidate._id}: expected type ${seedDocument._type}`);
      }
    }
    if (currentDocument && legacyDocument) {
      throw new Error(`Migration conflict: both ${seedDocument._id} and ${legacyId} exist`);
    }
    if (currentDraft && legacyDraft) {
      throw new Error(`Migration conflict: both drafts.${seedDocument._id} and drafts.${legacyId} exist`);
    }

    if (legacyDocument) {
      migration.createOrReplace(withoutSystemFields(legacyDocument, seedDocument._id));
      removableLegacyIds.push(legacyId);
    } else {
      migration.createIfNotExists(seedDocument);
    }

    if (legacyDraft) {
      migration.createOrReplace(withoutSystemFields(legacyDraft, `drafts.${seedDocument._id}`));
      removableLegacyIds.push(`drafts.${legacyId}`);
    }
  }

  removableLegacyIds.forEach((id) => migration.delete(id));
  await migration.commit();

  console.log(JSON.stringify({
    mode: "create-if-absent",
    count: documents.length,
    ids: documents.map(({ _id }) => _id),
    removedLegacyCount: removableLegacyIds.length,
  }, null, 2));
}
