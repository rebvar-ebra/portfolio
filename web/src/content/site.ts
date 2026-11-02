import type { Locale } from "@/lib/i18n";

export type ProjectKind = "professional" | "demo" | "learning";

export type ProjectDefinition = {
  slug: "3d-scan-platform" | "restaurant-operations" | "neuer-tag-ev";
  kind: ProjectKind;
  technologies: readonly string[];
  publicSafe: boolean;
  hasConfidentialSource: boolean;
  liveUrl: string | null;
  repositoryUrl: string | null;
  coverImage: string;
};

export const projects: readonly ProjectDefinition[] = [
  {
    slug: "3d-scan-platform",
    kind: "professional",
    technologies: ["React", "Node.js", "Python", "FastAPI", "Nextcloud"],
    publicSafe: true,
    hasConfidentialSource: true,
    liveUrl: "https://www.think3ddd.de/",
    repositoryUrl: null,
    coverImage: "/project-covers/scan-platform.svg",
  },
  {
    slug: "restaurant-operations",
    kind: "demo",
    technologies: ["Next.js", "TypeScript", "Sanity", "Docker"],
    publicSafe: true,
    hasConfidentialSource: false,
    liveUrl: null,
    repositoryUrl: null,
    coverImage: "/project-covers/restaurant-operations.svg",
  },
  {
    slug: "neuer-tag-ev",
    kind: "professional",
    technologies: ["Next.js", "TypeScript", "Sanity", "Vercel"],
    publicSafe: true,
    hasConfidentialSource: false,
    liveUrl: "https://neuertag-ev.de/",
    repositoryUrl: null,
    coverImage: "/project-covers/neuer-tag-ev.svg",
  },
] as const;

type NavigationItem = {
  label: string;
  href: string;
};

type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: readonly string[];
};

type EducationEntry = {
  degree: string;
  institution: string;
  period: string;
  location: string;
  detail: string | null;
};

type LanguageEntry = {
  name: string;
  level: string;
  proficiency: "Native" | "C1" | "B2";
};

type CertificationEntry = {
  name: string;
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
    email: string;
    github: null;
    linkedin: string;
    resume: null;
    introduction: string;
  };
  navigation: readonly NavigationItem[];
  home: {
    headline: string;
    intro: string;
    primaryAction: NavigationItem;
    contactAction: NavigationItem;
    approachTitle: string;
    approach: string;
    selectedWork: string;
    workLabel: string;
    methodLabel: string;
    requestPath: {
      title: string;
      nodes: readonly { index: string; title: string; description: string }[];
    };
    approachSteps: readonly { phase: string; title: string; body: string }[];
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
    problem: string;
    role: string;
    solution: string;
    decisions: string;
    challenges: string;
    learned: string;
    liveDemo: string;
    sourceUnavailable: string;
    typeLabel: string;
    linksLabel: string;
  };
  projectsPage: { title: string; intro: string };
  about: {
    label: string;
    title: string;
    intro: string;
    experienceTitle: string;
    educationTitle: string;
    skillsTitle: string;
    languagesTitle: string;
    certificationsTitle: string;
    learningTitle: string;
    learning: string;
    experience: readonly ExperienceEntry[];
    education: readonly EducationEntry[];
    languages: readonly LanguageEntry[];
    certifications: readonly CertificationEntry[];
    skills: readonly { group: string; items: readonly string[] }[];
  };
  contact: {
    label: string;
    title: string;
    intro: string;
    directTitle: string;
    emailLabel: string;
    linkedinLabel: string;
    note: string;
  };
  projectCopy: readonly ProjectCopy[];
  footer: { note: string; availability: string };
};

const route = (locale: Locale, path = "") => `/${locale}${path}`;

const sharedPerson = {
  name: "Rebvar Ebrahimi" as const,
  email: "rebvar.ebrahimy@gmail.com",
  github: null,
  linkedin: "https://linkedin.com/in/rebvar-ebrahimi",
  resume: null,
};

const englishContent: SiteContent = {
  locale: "en",
  languageName: "English",
  person: {
    ...sharedPerson,
    role: "Full-Stack Developer",
    location: "Berlin, Germany",
    introduction:
      "Full-stack developer in Berlin with experience across React interfaces, Node.js and Python services, CI/CD, container delivery, and IT operations.",
  },
  navigation: [
    { label: "Home", href: route("en") },
    { label: "Projects", href: route("en", "/projects") },
    { label: "About", href: route("en", "/about") },
    { label: "Contact", href: route("en", "/contact") },
  ],
  home: {
    headline: "I turn complex ideas into useful web products.",
    intro:
      "Hi, I’m Rebvar—a full-stack developer in Berlin working from the interface down to the data model.",
    primaryAction: { label: "View projects", href: route("en", "/projects") },
    contactAction: { label: "Contact", href: route("en", "/contact") },
    approachTitle: "Built as one connected system",
    approach:
      "I start with the person using the product, make the data flow explicit, and keep each layer understandable enough to change safely.",
    selectedWork: "Selected work",
    workLabel: "Work index",
    methodLabel: "Method",
    requestPath: {
      title: "A request, made visible",
      nodes: [
        { index: "01", title: "Interface", description: "Intent becomes structured input" },
        { index: "02", title: "API", description: "Rules validate and coordinate" },
        { index: "03", title: "Data", description: "State changes, then flows back" },
      ],
    },
    approachSteps: [
      { phase: "Input", title: "Understand the real job", body: "Start with the person using the product and the outcome they need." },
      { phase: "Flow", title: "Make the system legible", body: "Keep the interface, service boundaries, and data movement clear enough to change safely." },
      { phase: "Proof", title: "Test the path that matters", body: "Verify the real user journey and the failure states around it." },
    ],
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
    problem: "The problem",
    role: "Role and contribution",
    solution: "The solution",
    decisions: "Technical decisions",
    challenges: "Challenges",
    learned: "What I learned",
    liveDemo: "Visit live website",
    sourceUnavailable: "Repository link not yet provided",
    typeLabel: "Type",
    linksLabel: "Links",
  },
  projectsPage: {
    title: "Work, decisions, and what I learned.",
    intro: "Three case studies spanning professional product work, full-stack product design, and a live nonprofit website.",
  },
  about: {
    label: "Profile",
    title: "Software development from interface to infrastructure.",
    intro:
      "I’m a detail-oriented full-stack developer based in Berlin. My experience spans an AI-assisted 3D reconstruction platform, solar-planning interfaces, CI/CD and container delivery, and hands-on IT administration.",
    experienceTitle: "Professional experience",
    educationTitle: "Education",
    skillsTitle: "Technical range",
    languagesTitle: "Languages",
    certificationsTitle: "Certifications",
    learningTitle: "Current focus",
    learning:
      "I’m deepening my backend and content-platform practice with Sanity, explicit interfaces, and production-minded testing.",
    experience: [
      {
        role: "Full-Stack Developer Intern",
        company: "Think3ddd",
        period: "Nov 2025 – Feb 2026",
        location: "Berlin, Germany",
        highlights: [
          "Developed and maintained a React, Node.js, and Python platform for AI-assisted 3D reconstruction of medical image data.",
          "Implemented Jenkins and GitLab CI/CD pipelines with automated testing and deployment workflows.",
          "Built and operated Dockerized applications on Cloudron and integrated Nextcloud, LDAP, and WebDAV.",
          "Investigated failures and improved performance across the React frontend, Node.js backend, and Python microservices.",
        ],
      },
      {
        role: "IT Administrator (Federal Volunteer Service)",
        company: "KJFE-Schabracke",
        period: "Sep 2024 – Nov 2025",
        location: "Berlin, Germany",
        highlights: [
          "Redesigned and maintained the organization’s PHP and Tailwind CSS website.",
          "Administered IT systems to support stable day-to-day operations.",
          "Supported software adoption and trained colleagues in effective use of new tools.",
        ],
      },
      {
        role: "Full-Stack Developer",
        company: "AI-nergy",
        period: "Dec 2022 – Jun 2023",
        location: "Copenhagen, Denmark",
        highlights: [
          "Built interactive Google Maps API components for the SolarPlanner application.",
          "Improved React interfaces for responsive, performant visualization of energy-generation data.",
          "Worked with an interdisciplinary team to translate product requirements into frontend features.",
        ],
      },
    ],
    education: [
      {
        degree: "MSc in Computer Science",
        institution: "University of Szeged",
        period: "Feb 2021 – Feb 2023",
        location: "Szeged, Hungary",
        detail: "Thesis: pBFT deployment in FoBSim and comparison with other blockchain consensus algorithms.",
      },
      {
        degree: "BSc in Computer Science",
        institution: "Azad University",
        period: "Sep 2012 – Jun 2014",
        location: "Mahabad, Iran",
        detail: null,
      },
    ],
    languages: [
      { name: "Kurdish", level: "Native", proficiency: "Native" },
      { name: "Persian", level: "Native", proficiency: "Native" },
      { name: "English", level: "C1 · Fluent", proficiency: "C1" },
      { name: "German", level: "B2", proficiency: "B2" },
    ],
    certifications: [
      { name: "DevOps on AWS: Code, Build, and Test", href: "https://www.coursera.org/account/accomplishments/certificate/XQXNFU9UA8TZ" },
      { name: "Python Project for AI & Application Development", href: "https://www.coursera.org/account/accomplishments/certificate/GQ8N76YZW2ZM" },
    ],
    skills: [
      { group: "Interface", items: ["JavaScript", "React", "HTML", "CSS", "Tailwind CSS", "Google Maps API"] },
      { group: "Backend", items: ["Sanity", "Node.js", "Python", "PHP", "SQL", "LDAP", "WebDAV", "Nextcloud"] },
      { group: "Delivery", items: ["Docker", "Jenkins", "GitLab CI/CD", "Cloudron", "Version control", "Agile"] },
    ],
  },
  contact: {
    label: "Contact",
    title: "Let’s talk about useful software.",
    intro:
      "I’m based in Berlin and open to full-stack and frontend opportunities. The quickest way to reach me is by email.",
    directTitle: "Professional channels",
    emailLabel: "Email",
    linkedinLabel: "LinkedIn",
    note: "This site does not publish my phone number or street address and does not send form data to a third party.",
  },
  projectCopy: [
    {
      slug: "3d-scan-platform",
      title: "3D Scan Platform",
      label: "Think3ddd · Professional work",
      summary: "A React, Node.js, and Python platform supporting AI-assisted 3D reconstruction of medical image data.",
      problem: "The platform connects a React interface, Node.js backend, Python microservices, and external file and identity services in a distributed medical-imaging workflow.",
      role: "Full-Stack Developer Intern at Think3ddd in Berlin from November 2025 to February 2026, contributing across frontend, backend, delivery, integrations, troubleshooting, and technical documentation.",
      solution: "The team operated containerized services with Docker and Cloudron, automated test and deployment workflows with Jenkins and GitLab, and integrated Nextcloud, LDAP, and WebDAV for file collaboration, identity, and secure data transfer.",
      decisions: ["Use React, Node.js, and Python across the platform’s interface and service layers.", "Automate testing and deployment through Jenkins and GitLab CI/CD.", "Connect Nextcloud, LDAP, and WebDAV to the wider platform workflow."],
      challenges: ["Tracing failures across a React frontend, Node.js backend, and Python microservices.", "Improving performance in a distributed system.", "Documenting complex architecture while keeping confidential implementation details private."],
      learning: "The role strengthened my experience in full-stack delivery, service integration, container operations, and collaborative architecture work.",
      disclosure: "CV-verified role and technology summary. No confidential data, private screens, metrics, or source code are shown.",
    },
    {
      slug: "restaurant-operations",
      title: "Restaurant Operations Demo",
      label: "Working full-stack demo",
      summary: "A small operations board for moving fictional orders from new to ready.",
      problem: "A kitchen team needs one clear view of incoming work, its current state, and the load at each stage.",
      role: "Designed and built as a portfolio demonstration of frontend, API, database, validation, and container delivery skills.",
      solution: "A Next.js interface uses Sanity as its structured content backend, keeping operational content editable and presentation concerns separate.",
      decisions: ["Use three explicit states instead of a configurable workflow.", "Model structured content in Sanity.", "Keep content queries separate from presentation components."],
      challenges: ["Designing a clear content model.", "Keeping loading and error states useful.", "Maintaining consistent structured content across views."],
      learning: "A narrow vertical slice can demonstrate architecture more honestly than a wide but simulated product.",
      disclosure: "All data is fictional. The demo does not collect customer or payment information.",
    },
    {
      slug: "neuer-tag-ev",
      title: "Neuer Tag e.V.",
      label: "Live nonprofit website · 2026",
      summary: "A content-led website for a Berlin nonprofit working for equal opportunity, empowerment, and an inclusive society.",
      problem: "Neuer Tag e.V. needed a clear public website that could introduce the organization, present its projects, publish news, guide people toward support, and make participation and donations easy to find.",
      role: "Designed and built the website end to end, including the public interface, structured content architecture, Sanity integration, and production delivery.",
      solution: "A responsive Next.js website uses Sanity as its content backend, giving the organization structured, editable pages for projects, news, help, membership, and donations while keeping the experience fast and focused.",
      decisions: ["Use Sanity so the organization can maintain structured content without code changes.", "Give projects, help, membership, and donations clear paths in the information architecture.", "Include a prominent quick-exit control for visitors who may need to leave sensitive content immediately."],
      challenges: ["Organizing a growing range of nonprofit content without overwhelming visitors.", "Balancing a distinctive visual identity with clarity and accessibility.", "Keeping editorial content flexible while preserving a consistent page system."],
      learning: "The project strengthened my practice in content modeling, nonprofit-focused information architecture, accessible interaction design, and production delivery with Next.js and Sanity.",
      disclosure: null,
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
    introduction:
      "Full-Stack-Entwickler in Berlin mit Erfahrung in React-Oberflächen, Node.js- und Python-Diensten, CI/CD, Container-Betrieb und IT-Administration.",
  },
  navigation: [
    { label: "Start", href: route("de") },
    { label: "Projekte", href: route("de", "/projects") },
    { label: "Über mich", href: route("de", "/about") },
    { label: "Kontakt", href: route("de", "/contact") },
  ],
  home: {
    headline: "Ich mache aus komplexen Ideen nützliche Webprodukte.",
    intro:
      "Hallo, ich bin Rebvar – Full-Stack-Entwickler in Berlin. Ich arbeite von der Oberfläche bis zum Datenmodell.",
    primaryAction: { label: "Projekte ansehen", href: route("de", "/projects") },
    contactAction: { label: "Kontakt", href: route("de", "/contact") },
    approachTitle: "Als zusammenhängendes System gedacht",
    approach:
      "Ich beginne bei den Menschen, die das Produkt nutzen, mache Datenflüsse sichtbar und halte jede Schicht so verständlich, dass sie sicher verändert werden kann.",
    selectedWork: "Ausgewählte Projekte",
    workLabel: "Projektübersicht",
    methodLabel: "Arbeitsweise",
    requestPath: {
      title: "Ein sichtbarer Datenfluss",
      nodes: [
        { index: "01", title: "Oberfläche", description: "Absicht wird zu strukturierter Eingabe" },
        { index: "02", title: "API", description: "Regeln prüfen und koordinieren" },
        { index: "03", title: "Daten", description: "Der Zustand ändert sich und fließt zurück" },
      ],
    },
    approachSteps: [
      { phase: "Eingabe", title: "Die tatsächliche Aufgabe verstehen", body: "Ausgangspunkt sind die Menschen, die das Produkt nutzen, und das Ergebnis, das sie benötigen." },
      { phase: "Ablauf", title: "Das System verständlich machen", body: "Oberfläche, Dienstgrenzen und Datenfluss bleiben so klar, dass sie sicher verändert werden können." },
      { phase: "Nachweis", title: "Den entscheidenden Weg testen", body: "Der echte Nutzungspfad und seine Fehlerzustände werden überprüft." },
    ],
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
    problem: "Das Problem",
    role: "Rolle und Beitrag",
    solution: "Die Lösung",
    decisions: "Technische Entscheidungen",
    challenges: "Herausforderungen",
    learned: "Was ich gelernt habe",
    liveDemo: "Live-Website öffnen",
    sourceUnavailable: "Repository-Link noch nicht vorhanden",
    typeLabel: "Art",
    linksLabel: "Links",
  },
  projectsPage: {
    title: "Arbeit, Entscheidungen und Erkenntnisse.",
    intro: "Drei Fallstudien aus professioneller Produktarbeit, Full-Stack-Produktgestaltung und einer live geschalteten Non-Profit-Website.",
  },
  about: {
    label: "Profil",
    title: "Softwareentwicklung von der Oberfläche bis zur Infrastruktur.",
    intro:
      "Ich bin ein detailorientierter Full-Stack-Entwickler in Berlin. Meine Erfahrung reicht von einer KI-gestützten 3D-Rekonstruktionsplattform und Solarplanungs-Oberflächen bis zu CI/CD, Container-Betrieb und praktischer IT-Administration.",
    experienceTitle: "Berufserfahrung",
    educationTitle: "Ausbildung",
    skillsTitle: "Technischer Schwerpunkt",
    languagesTitle: "Sprachen",
    certificationsTitle: "Zertifizierungen",
    learningTitle: "Aktueller Schwerpunkt",
    learning:
      "Ich vertiefe Backend- und Content-Plattform-Entwicklung mit Sanity, klaren Schnittstellen und produktionsnahen Tests.",
    experience: [
      {
        role: "Praktikum als Full-Stack-Entwickler",
        company: "Think3ddd",
        period: "Nov. 2025 – Feb. 2026",
        location: "Berlin, Deutschland",
        highlights: [
          "Entwicklung und Wartung einer Plattform mit React, Node.js und Python für die KI-gestützte 3D-Rekonstruktion medizinischer Bilddaten.",
          "Aufbau von Jenkins- und GitLab-CI/CD-Pipelines mit automatisierten Tests und Deployment-Abläufen.",
          "Betrieb containerisierter Anwendungen mit Docker auf Cloudron sowie Integration von Nextcloud, LDAP und WebDAV.",
          "Fehleranalyse und Performance-Optimierung im React-Frontend, Node.js-Backend und in Python-Microservices.",
        ],
      },
      {
        role: "IT-Administrator (Bundesfreiwilligendienst)",
        company: "KJFE-Schabracke",
        period: "Sept. 2024 – Nov. 2025",
        location: "Berlin, Deutschland",
        highlights: [
          "Neugestaltung und Pflege der Website mit PHP und Tailwind CSS.",
          "Verwaltung und Wartung der IT-Systeme für einen stabilen täglichen Betrieb.",
          "Unterstützung bei der Einführung neuer Software und Schulung von Mitarbeitenden.",
        ],
      },
      {
        role: "Full-Stack-Entwickler",
        company: "AI-nergy",
        period: "Dez. 2022 – Juni 2023",
        location: "Kopenhagen, Dänemark",
        highlights: [
          "Entwicklung interaktiver Google-Maps-API-Komponenten für die SolarPlanner-Anwendung.",
          "Optimierung von React-Oberflächen zur responsiven und performanten Darstellung von Energieerzeugungsdaten.",
          "Zusammenarbeit mit einem interdisziplinären Team bei der Umsetzung technischer Anforderungen.",
        ],
      },
    ],
    education: [
      {
        degree: "MSc Computer Science",
        institution: "Universität Szeged",
        period: "Feb. 2021 – Feb. 2023",
        location: "Szeged, Ungarn",
        detail: "Abschlussarbeit: pBFT-Deployment in FoBSim und Vergleich mit anderen Blockchain-Konsensalgorithmen.",
      },
      {
        degree: "BSc Computer Science",
        institution: "Azad Universität",
        period: "Sept. 2012 – Juni 2014",
        location: "Mahabad, Iran",
        detail: null,
      },
    ],
    languages: [
      { name: "Kurdisch", level: "Muttersprache", proficiency: "Native" },
      { name: "Persisch", level: "Muttersprache", proficiency: "Native" },
      { name: "Englisch", level: "C1 · Fließend", proficiency: "C1" },
      { name: "Deutsch", level: "B2", proficiency: "B2" },
    ],
    certifications: [
      { name: "DevOps on AWS: Code, Build, and Test", href: "https://www.coursera.org/account/accomplishments/certificate/XQXNFU9UA8TZ" },
      { name: "Python Project for AI & Application Development", href: "https://www.coursera.org/account/accomplishments/certificate/GQ8N76YZW2ZM" },
    ],
    skills: [
      { group: "Oberfläche", items: ["JavaScript", "React", "HTML", "CSS", "Tailwind CSS", "Google Maps API"] },
      { group: "Backend-Systeme", items: ["Sanity", "Node.js", "Python", "PHP", "SQL", "LDAP", "WebDAV", "Nextcloud"] },
      { group: "Bereitstellung", items: ["Docker", "Jenkins", "GitLab CI/CD", "Cloudron", "Versionsverwaltung", "Agile"] },
    ],
  },
  contact: {
    label: "Kontakt",
    title: "Sprechen wir über nützliche Software.",
    intro:
      "Ich lebe in Berlin und bin offen für Full-Stack- und Frontend-Möglichkeiten. Am schnellsten bin ich per E-Mail erreichbar.",
    directTitle: "Berufliche Kontaktwege",
    emailLabel: "E-Mail",
    linkedinLabel: "LinkedIn",
    note: "Diese Website veröffentlicht weder meine Telefonnummer noch meine Straßenadresse und sendet keine Formulardaten an Dritte.",
  },
  projectCopy: [
    {
      slug: "3d-scan-platform",
      title: "3D-Scan-Plattform",
      label: "Think3ddd · Berufserfahrung",
      summary: "Eine Plattform mit React, Node.js und Python für die KI-gestützte 3D-Rekonstruktion medizinischer Bilddaten.",
      problem: "Die Plattform verbindet eine React-Oberfläche, ein Node.js-Backend, Python-Microservices sowie externe Datei- und Identitätsdienste in einem verteilten medizinischen Bildverarbeitungsablauf.",
      role: "Praktikum als Full-Stack-Entwickler bei Think3ddd in Berlin von November 2025 bis Februar 2026 mit Beiträgen zu Frontend, Backend, Bereitstellung, Integrationen, Fehleranalyse und technischer Dokumentation.",
      solution: "Das Team betrieb containerisierte Dienste mit Docker und Cloudron, automatisierte Test- und Deployment-Abläufe mit Jenkins und GitLab und integrierte Nextcloud, LDAP und WebDAV für Dateizusammenarbeit, Identität und sichere Datenübertragung.",
      decisions: ["React, Node.js und Python für die Oberflächen- und Dienstschichten einsetzen.", "Tests und Deployments mit Jenkins und GitLab CI/CD automatisieren.", "Nextcloud, LDAP und WebDAV in den Plattformablauf integrieren."],
      challenges: ["Fehler über React-Frontend, Node.js-Backend und Python-Microservices hinweg analysieren.", "Performance in einem verteilten System verbessern.", "Komplexe Architektur dokumentieren und vertrauliche Umsetzungsdetails schützen."],
      learning: "Die Tätigkeit vertiefte meine Erfahrung in Full-Stack-Bereitstellung, Dienstintegration, Container-Betrieb und gemeinsamer Architekturarbeit.",
      disclosure: "Durch den Lebenslauf bestätigte Rolle und Technologieübersicht. Vertrauliche Daten, private Ansichten, Kennzahlen und Quellcode werden nicht gezeigt.",
    },
    {
      slug: "restaurant-operations",
      title: "Restaurant Operations Demo",
      label: "Funktionierende Full-Stack-Demo",
      summary: "Eine kompakte Übersicht, die fiktive Bestellungen von ‚Neu‘ bis ‚Fertig‘ begleitet.",
      problem: "Ein Küchenteam benötigt eine klare Ansicht eingehender Arbeit, ihres aktuellen Status und der Auslastung jeder Phase.",
      role: "Als Portfolio-Demo für Frontend, API, Datenbank, Validierung und Container-Betrieb konzipiert und umgesetzt.",
      solution: "Eine Next.js-Oberfläche nutzt Sanity als strukturiertes Content-Backend und trennt editierbare Inhalte klar von der Darstellung.",
      decisions: ["Drei klare Zustände statt eines konfigurierbaren Workflows.", "Strukturierte Inhalte in Sanity modellieren.", "Content-Abfragen von Darstellungskomponenten trennen."],
      challenges: ["Ein klares Content-Modell entwerfen.", "Lade- und Fehlerzustände hilfreich gestalten.", "Strukturierte Inhalte über Ansichten hinweg konsistent halten."],
      learning: "Ein schmaler, vollständiger Funktionspfad zeigt Architektur ehrlicher als ein breites, aber nur simuliertes Produkt.",
      disclosure: "Alle Daten sind fiktiv. Die Demo erfasst keine Kunden- oder Zahlungsdaten.",
    },
    {
      slug: "neuer-tag-ev",
      title: "Neuer Tag e.V.",
      label: "Live-Website für einen gemeinnützigen Verein · 2026",
      summary: "Eine inhaltsorientierte Website für einen Berliner Verein, der sich für Chancengleichheit, Empowerment und eine vielfältige Gesellschaft einsetzt.",
      problem: "Neuer Tag e.V. benötigte eine klare öffentliche Website, die den Verein vorstellt, Projekte und Neuigkeiten veröffentlicht, zu Beratung und Hilfe führt und Beteiligung sowie Spenden leicht auffindbar macht.",
      role: "Konzeption und Umsetzung der Website von der öffentlichen Oberfläche über die strukturierte Content-Architektur und Sanity-Integration bis zur produktiven Bereitstellung.",
      solution: "Eine responsive Next.js-Website nutzt Sanity als Content-Backend. Der Verein kann damit strukturierte Inhalte für Projekte, News, Hilfe, Mitgliedschaft und Spenden pflegen, während die Nutzung schnell und fokussiert bleibt.",
      decisions: ["Sanity einsetzen, damit der Verein strukturierte Inhalte ohne Codeänderungen pflegen kann.", "Projekte, Hilfe, Mitgliedschaft und Spenden als klare Wege in der Informationsarchitektur abbilden.", "Eine gut sichtbare Schnell-verlassen-Funktion für Menschen anbieten, die sensible Inhalte sofort verlassen müssen."],
      challenges: ["Ein wachsendes Spektrum gemeinnütziger Inhalte übersichtlich organisieren.", "Eine eigenständige visuelle Identität mit Klarheit und Barrierearmut verbinden.", "Redaktionelle Flexibilität ermöglichen und zugleich ein konsistentes Seitensystem bewahren."],
      learning: "Das Projekt vertiefte meine Erfahrung mit Content-Modellierung, Informationsarchitektur für gemeinnützige Organisationen, barrierearmen Interaktionen und produktiver Bereitstellung mit Next.js und Sanity.",
      disclosure: null,
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
