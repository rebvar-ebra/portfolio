import { localizedString, localizedText } from "./localized";
import { portfolioProjectTypes } from "./portfolio-project";
import { portfolioSiteTypes } from "./portfolio-site-settings";

export const schemaTypes = [localizedString, localizedText, ...portfolioSiteTypes, ...portfolioProjectTypes];

