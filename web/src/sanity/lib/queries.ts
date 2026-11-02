import { defineQuery } from "next-sanity";

const localeFields = `
  person{name, role, location, introduction},
  navigation{home, projects, about, contact},
  home{headline, intro, primaryActionLabel, contactActionLabel, approachTitle, selectedWork, workLabel, methodLabel, approachSteps[]{phase, title, body}},
  common{viewProject, technologies, detailsNeeded, demoLabel, backToProjects, skipToContent, menu, closeMenu, problem, role, solution, decisions, challenges, learned, liveDemo, sourceUnavailable, typeLabel, linksLabel},
  projectsPage{label, title, intro},
  about{
    label, title, intro, experienceTitle, educationTitle, skillsTitle, languagesTitle, certificationsTitle, learningTitle, learning,
    experience[]{role, company, period, location, highlights},
    education[]{degree, institution, period, location, detail},
    languages[]{name, level, proficiency},
    certifications[]{name, href},
    skills[]{group, items}
  },
  contact{label, title, intro, formTitle, nameLabel, emailLabel, subjectLabel, messageLabel, consentLabel, submitLabel, submittingLabel, successMessage, errorMessage, uncertainMessage, linkedinLabel, note},
  footer{note, availability}
`;

const projectLocaleFields = `
  title, label, summary, problem, role, solution, decisions, challenges, learning, disclosure
`;

export const portfolioQuery = defineQuery(`{
  "settings": *[_type == "portfolioSiteSettings" && _id == "portfolio.siteSettings"][0]{
    linkedin,
    english{${localeFields}},
    german{${localeFields}}
  },
  "projects": *[_type == "portfolioProject" && publicSafe == true] | order(order asc){
    "slug": slug.current,
    order,
    featured,
    kind,
    technologies,
    publicSafe,
    hasConfidentialSource,
    liveUrl,
    repositoryUrl,
    "coverImageUrl": coalesce(coverImage.asset->url, coverImagePath),
    english{${projectLocaleFields}},
    german{${projectLocaleFields}}
  }
}`);

