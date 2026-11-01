import type { Locale } from "@/lib/i18n";

export type ProjectKind = "professional" | "demo" | "learning";

export type ProjectDefinition = {
  slug: "3d-scan-platform" | "restaurant-operations" | "go-ecommerce";
  kind: ProjectKind;
  technologies: readonly string[];
  publicSafe: boolean;
  hasConfidentialSource: boolean;
  liveUrl: string | null;
  repositoryUrl: string | null;
};

export const projects: readonly ProjectDefinition[] = [
  {
    slug: "3d-scan-platform",
    kind: "professional",
    technologies: ["React", "Node.js", "Python", "FastAPI", "Nextcloud"],
    publicSafe: true,
    hasConfidentialSource: true,
    liveUrl: null,
    repositoryUrl: null,
  },
  {
    slug: "restaurant-operations",
    kind: "demo",
    technologies: ["Next.js", "TypeScript", "Go", "PostgreSQL", "Docker"],
    publicSafe: true,
    hasConfidentialSource: false,
    liveUrl: "/lab",
    repositoryUrl: null,
  },
  {
    slug: "go-ecommerce",
    kind: "learning",
    technologies: ["Go"],
    publicSafe: true,
    hasConfidentialSource: false,
    liveUrl: null,
    repositoryUrl: null,
  },
] as const;

type NavigationItem = {
  label: string;
  href: string;
};

export type ProjectCopy = {
  slug: ProjectDefinition["slug"];
  title: string;
  label: string;
  summary: string;
  problem: string;
  role: string;
  solution: string;
  decisions: readonly string[];
  challenges: readonly string[];
  learning: string;
  disclosure: string | null;
};

export type SiteContent = {
  locale: Locale;
  languageName: string;
  person: {
    name: "Rebvar Ebrahimi";
    role: string;
    location: string;
    email: null;
    github: null;
    linkedin: null;
    resume: null;
    education: string;
    introduction: string;
  };
  navigation: readonly NavigationItem[];
  home: {
    headline: string;
    intro: string;
    primaryAction: NavigationItem;
    demoAction: NavigationItem;
    contactAction: NavigationItem;
    approachTitle: string;
    approach: string;
    selectedWork: string;
  };
  common: {
    viewProject: string;
    technologies: string;
    detailsNeeded: string;
    demoLabel: string;
    backToProjects: string;
    skipToContent: string;
    menu: string;
    closeMenu: string;
  };
  projectsPage: { title: string; intro: string };
  about: {
    title: string;
    intro: string;
    educationTitle: string;
    skillsTitle: string;
    learningTitle: string;
    learning: string;
    skills: readonly { group: string; items: readonly string[] }[];
  };
  contact: {
    title: string;
    intro: string;
    placeholderTitle: string;
    placeholder: string;
  };
  lab: {
    title: string;
    intro: string;
    fictionalNotice: string;
  };
  projectCopy: readonly ProjectCopy[];
  footer: { note: string; availability: string };
};

const route = (locale: Locale, path = "") => `/${locale}${path}`;

const sharedPerson = {
  name: "Rebvar Ebrahimi" as const,
  email: null,
  github: null,
  linkedin: null,
  resume: null,
};

const englishContent: SiteContent = {
  locale: "en",
  languageName: "English",
  person: {
    ...sharedPerson,
    role: "Full-Stack Developer",
    location: "Berlin, Germany",
    education: "MSc in Computer Science, University of Szeged",
    introduction:
      "I build useful web products across the interface, API, and data layer. My work combines careful product thinking with dependable implementation.",
  },
  navigation: [
    { label: "Home", href: route("en") },
    { label: "Projects", href: route("en", "/projects") },
    { label: "About", href: route("en", "/about") },
    { label: "Lab", href: route("en", "/lab") },
    { label: "Contact", href: route("en", "/contact") },
  ],
  home: {
    headline: "I turn complex ideas into useful web products.",
    intro:
      "Hi, I’m Rebvar—a full-stack developer in Berlin working from the interface down to the data model.",
    primaryAction: { label: "View projects", href: route("en", "/projects") },
    demoAction: { label: "Try the demo", href: route("en", "/lab") },
    contactAction: { label: "Contact", href: route("en", "/contact") },
    approachTitle: "Built as one connected system",
    approach:
      "I start with the person using the product, make the data flow explicit, and keep each layer understandable enough to change safely.",
    selectedWork: "Selected work",
  },
  common: {
    viewProject: "Read case study",
    technologies: "Technologies",
    detailsNeeded: "Details needed",
    demoLabel: "Fictional demo data",
    backToProjects: "Back to projects",
    skipToContent: "Skip to content",
    menu: "Open menu",
    closeMenu: "Close menu",
  },
  projectsPage: {
    title: "Work, decisions, and what I learned.",
    intro:
      "Three projects at different stages: professional product work, a working full-stack demo, and a Go learning project.",
  },
  about: {
    title: "A product-minded developer across the stack.",
    intro:
      "I’m a full-stack developer based in Berlin with an MSc in Computer Science from the University of Szeged. I enjoy turning unclear requirements into small, testable systems.",
    educationTitle: "Education",
    skillsTitle: "Technical range",
    learningTitle: "Currently learning",
    learning:
      "I’m learning Go by building small services and studying how explicit interfaces and simple concurrency shape reliable backends.",
    skills: [
      { group: "Interface", items: ["JavaScript", "TypeScript", "React", "Next.js"] },
      { group: "Services", items: ["Node.js", "Python", "FastAPI", "Go (learning)"] },
      { group: "Data & delivery", items: ["MongoDB", "PostgreSQL", "Docker"] },
    ],
  },
  contact: {
    title: "Let’s talk about useful software.",
    intro:
      "A verified email address and professional profile links have not been provided yet, so this site does not invent them or send form data anywhere.",
    placeholderTitle: "Contact details are being prepared",
    placeholder:
      "Add a public email address, LinkedIn URL, GitHub URL, and résumé link in the content file before launch.",
  },
  lab: {
    title: "Restaurant operations, from order to ready.",
    intro:
      "Create a fictional order, move it through the kitchen, and watch the dashboard update through a Go API and PostgreSQL.",
    fictionalNotice: "Demo only. All names and orders are fictional; no payment or customer data is collected.",
  },
  projectCopy: [
    {
      slug: "3d-scan-platform",
      title: "3D Scan Platform",
      label: "Public-safe reconstruction",
      summary: "A platform workflow connecting scan-related interfaces, services, and file collaboration.",
      problem: "3D scanning workflows cross multiple technical systems and need a coherent interface for complex processing steps.",
      role: "Rebvar contributed across React, Node.js, Python/FastAPI, and Nextcloud parts of the platform. Employer, dates, and confidential implementation details are intentionally omitted.",
      solution: "This case study reconstructs the system shape with neutral diagrams and public-safe descriptions rather than private screens or source code.",
      decisions: ["Separate user-facing progress from backend processing details.", "Keep service boundaries visible so failures can be traced.", "Use Nextcloud as part of the file collaboration workflow."],
      challenges: ["Representing long-running technical work clearly.", "Coordinating JavaScript and Python service boundaries.", "Explaining the work without exposing confidential material."],
      learning: "Complex technical products become easier to operate when progress, ownership, and failure states are explicit.",
      disclosure: "Conceptual reconstruction. No confidential data, screenshots, metrics, or source code are shown.",
    },
    {
      slug: "restaurant-operations",
      title: "Restaurant Operations Demo",
      label: "Working full-stack demo",
      summary: "A small operations board for moving fictional orders from new to ready.",
      problem: "A kitchen team needs one clear view of incoming work, its current state, and the load at each stage.",
      role: "Designed and built as a portfolio demonstration of frontend, API, database, validation, and container delivery skills.",
      solution: "A Next.js dashboard calls a Go API backed by PostgreSQL. Server-Sent Events notify open clients when orders change.",
      decisions: ["Use three explicit states instead of a configurable workflow.", "Keep derived statistics out of stored data.", "Use SSE for one-way update notifications with less complexity than WebSockets."],
      challenges: ["Treating a public demo as untrusted input.", "Keeping reconnect and error states useful.", "Providing deterministic seed and reset behavior."],
      learning: "A narrow vertical slice can demonstrate architecture more honestly than a wide but simulated product.",
      disclosure: "All data is fictional. The demo does not collect customer or payment information.",
    },
    {
      slug: "go-ecommerce",
      title: "Go E-commerce",
      label: "Learning project",
      summary: "A clearly labelled space for documenting Go learning through an e-commerce domain.",
      problem: "The project is used to learn Go through a familiar domain without claiming production experience.",
      role: "Learner and builder. Specific features, repository links, and screenshots still need verification before publication.",
      solution: "The case study records learning goals now and leaves unverified implementation details as explicit gaps.",
      decisions: ["Label the work as learning.", "Publish only implemented, verified features.", "Prefer clear standard-library patterns before adding frameworks."],
      challenges: ["Learning idiomatic error handling.", "Designing small interfaces.", "Separating study goals from portfolio claims."],
      learning: "In progress: verified notes and features will be added as the project develops.",
      disclosure: "Placeholder case study. Add verified features and links before launch.",
    },
  ],
  footer: {
    note: "Designed and built by Rebvar Ebrahimi.",
    availability: "Berlin, Germany · Open to full-stack and frontend opportunities.",
  },
};

const germanContent: SiteContent = {
  locale: "de",
  languageName: "Deutsch",
  person: {
    ...sharedPerson,
    role: "Full-Stack-Entwickler",
    location: "Berlin, Deutschland",
    education: "MSc in Informatik, Universität Szeged",
    introduction:
      "Ich entwickle nützliche Webprodukte – von der Benutzeroberfläche über die API bis zur Datenschicht. Dabei verbinde ich Produktdenken mit einer verlässlichen Umsetzung.",
  },
  navigation: [
    { label: "Start", href: route("de") },
    { label: "Projekte", href: route("de", "/projects") },
    { label: "Über mich", href: route("de", "/about") },
    { label: "Labor", href: route("de", "/lab") },
    { label: "Kontakt", href: route("de", "/contact") },
  ],
  home: {
    headline: "Ich mache aus komplexen Ideen nützliche Webprodukte.",
    intro:
      "Hallo, ich bin Rebvar – Full-Stack-Entwickler in Berlin. Ich arbeite von der Oberfläche bis zum Datenmodell.",
    primaryAction: { label: "Projekte ansehen", href: route("de", "/projects") },
    demoAction: { label: "Demo ausprobieren", href: route("de", "/lab") },
    contactAction: { label: "Kontakt", href: route("de", "/contact") },
    approachTitle: "Als zusammenhängendes System gedacht",
    approach:
      "Ich beginne bei den Menschen, die das Produkt nutzen, mache Datenflüsse sichtbar und halte jede Schicht so verständlich, dass sie sicher verändert werden kann.",
    selectedWork: "Ausgewählte Projekte",
  },
  common: {
    viewProject: "Fallstudie lesen",
    technologies: "Technologien",
    detailsNeeded: "Angaben fehlen",
    demoLabel: "Fiktive Demodaten",
    backToProjects: "Zurück zu den Projekten",
    skipToContent: "Zum Inhalt springen",
    menu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  projectsPage: {
    title: "Arbeit, Entscheidungen und Erkenntnisse.",
    intro:
      "Drei Projekte in unterschiedlichen Phasen: professionelle Produktarbeit, eine funktionierende Full-Stack-Demo und ein Go-Lernprojekt.",
  },
  about: {
    title: "Produktorientierte Entwicklung über den gesamten Stack.",
    intro:
      "Ich bin Full-Stack-Entwickler in Berlin und habe einen MSc in Informatik von der Universität Szeged. Unklare Anforderungen übersetze ich gern in kleine, testbare Systeme.",
    educationTitle: "Ausbildung",
    skillsTitle: "Technischer Schwerpunkt",
    learningTitle: "Aktuell lerne ich",
    learning:
      "Ich lerne Go, indem ich kleine Dienste entwickle und untersuche, wie klare Schnittstellen und einfache Nebenläufigkeit zu verlässlichen Backends beitragen.",
    skills: [
      { group: "Oberfläche", items: ["JavaScript", "TypeScript", "React", "Next.js"] },
      { group: "Dienste", items: ["Node.js", "Python", "FastAPI", "Go (in Weiterbildung)"] },
      { group: "Daten & Betrieb", items: ["MongoDB", "PostgreSQL", "Docker"] },
    ],
  },
  contact: {
    title: "Sprechen wir über nützliche Software.",
    intro:
      "Eine bestätigte E-Mail-Adresse und berufliche Profil-Links liegen noch nicht vor. Deshalb erfindet diese Website keine Kontaktdaten und versendet keine Formulardaten.",
    placeholderTitle: "Kontaktdaten werden vorbereitet",
    placeholder:
      "Vor dem Start müssen eine öffentliche E-Mail-Adresse sowie LinkedIn-, GitHub- und Lebenslauf-Links in der Inhaltsdatei ergänzt werden.",
  },
  lab: {
    title: "Restaurantabläufe – von der Bestellung bis zur Ausgabe.",
    intro:
      "Lege eine fiktive Bestellung an, bewege sie durch die Küche und beobachte die Aktualisierung über eine Go-API und PostgreSQL.",
    fictionalNotice: "Nur eine Demo. Alle Namen und Bestellungen sind fiktiv; Zahlungs- oder Kundendaten werden nicht erfasst.",
  },
  projectCopy: [
    {
      slug: "3d-scan-platform",
      title: "3D-Scan-Plattform",
      label: "Öffentlich sichere Rekonstruktion",
      summary: "Ein Plattformablauf, der Oberflächen, Dienste und Dateizusammenarbeit für Scan-Prozesse verbindet.",
      problem: "3D-Scan-Abläufe führen durch mehrere technische Systeme und benötigen eine verständliche Oberfläche für komplexe Verarbeitungsschritte.",
      role: "Rebvar arbeitete an Teilen der Plattform mit React, Node.js, Python/FastAPI und Nextcloud. Arbeitgeber, Zeitangaben und vertrauliche Details bleiben bewusst ungenannt.",
      solution: "Diese Fallstudie rekonstruiert die Systemstruktur mit neutralen Diagrammen und öffentlich sicheren Beschreibungen statt mit privaten Ansichten oder Quellcode.",
      decisions: ["Den sichtbaren Fortschritt von Backend-Details trennen.", "Dienstgrenzen sichtbar halten, damit Fehler nachvollziehbar bleiben.", "Nextcloud in die Dateizusammenarbeit einbinden."],
      challenges: ["Lang laufende technische Arbeit verständlich darstellen.", "JavaScript- und Python-Dienste koordinieren.", "Die Arbeit ohne vertrauliches Material erklären."],
      learning: "Komplexe technische Produkte werden leichter bedienbar, wenn Fortschritt, Zuständigkeit und Fehlerzustände klar sind.",
      disclosure: "Konzeptionelle Rekonstruktion. Es werden keine vertraulichen Daten, Screenshots, Kennzahlen oder Quelltexte gezeigt.",
    },
    {
      slug: "restaurant-operations",
      title: "Restaurant Operations Demo",
      label: "Funktionierende Full-Stack-Demo",
      summary: "Eine kompakte Übersicht, die fiktive Bestellungen von ‚Neu‘ bis ‚Fertig‘ begleitet.",
      problem: "Ein Küchenteam benötigt eine klare Ansicht eingehender Arbeit, ihres aktuellen Status und der Auslastung jeder Phase.",
      role: "Als Portfolio-Demo für Frontend, API, Datenbank, Validierung und Container-Betrieb konzipiert und umgesetzt.",
      solution: "Ein Next.js-Dashboard greift auf eine Go-API mit PostgreSQL zu. Server-Sent Events informieren offene Clients über Änderungen.",
      decisions: ["Drei klare Zustände statt eines konfigurierbaren Workflows.", "Abgeleitete Kennzahlen nicht speichern.", "SSE für einseitige Aktualisierungen mit weniger Komplexität als WebSockets."],
      challenges: ["Eine öffentliche Demo als nicht vertrauenswürdige Eingabe behandeln.", "Verbindungs- und Fehlerzustände hilfreich gestalten.", "Deterministische Start- und Rücksetzdaten bereitstellen."],
      learning: "Ein schmaler, vollständiger Funktionspfad zeigt Architektur ehrlicher als ein breites, aber nur simuliertes Produkt.",
      disclosure: "Alle Daten sind fiktiv. Die Demo erfasst keine Kunden- oder Zahlungsdaten.",
    },
    {
      slug: "go-ecommerce",
      title: "Go E-Commerce",
      label: "Lernprojekt",
      summary: "Ein klar gekennzeichneter Bereich, der das Lernen von Go anhand einer E-Commerce-Domäne dokumentiert.",
      problem: "Das Projekt dient dazu, Go in einer vertrauten Domäne zu lernen, ohne Produktionserfahrung zu behaupten.",
      role: "Lernender und Entwickler. Konkrete Funktionen, Repository-Links und Screenshots müssen vor der Veröffentlichung noch bestätigt werden.",
      solution: "Die Fallstudie hält derzeit Lernziele fest und markiert nicht bestätigte Umsetzungsdetails ausdrücklich als offen.",
      decisions: ["Die Arbeit als Lernprojekt kennzeichnen.", "Nur umgesetzte und überprüfte Funktionen veröffentlichen.", "Vor Frameworks zunächst klare Standardbibliothek-Muster lernen."],
      challenges: ["Idiomatische Fehlerbehandlung lernen.", "Kleine Schnittstellen entwerfen.", "Lernziele von Portfolio-Aussagen trennen."],
      learning: "In Arbeit: Bestätigte Notizen und Funktionen werden mit der Entwicklung ergänzt.",
      disclosure: "Platzhalter-Fallstudie. Vor dem Start bestätigte Funktionen und Links ergänzen.",
    },
  ],
  footer: {
    note: "Gestaltet und entwickelt von Rebvar Ebrahimi.",
    availability: "Berlin, Deutschland · Offen für Full-Stack- und Frontend-Möglichkeiten.",
  },
};

const contentByLocale: Record<Locale, SiteContent> = {
  en: englishContent,
  de: germanContent,
};

export const getSiteContent = (locale: Locale): SiteContent => contentByLocale[locale];

export const getProjectDefinition = (slug: string): ProjectDefinition | undefined =>
  projects.find((project) => project.slug === slug);

export const getProjectCopy = (locale: Locale, slug: string): ProjectCopy | undefined =>
  getSiteContent(locale).projectCopy.find((project) => project.slug === slug);
