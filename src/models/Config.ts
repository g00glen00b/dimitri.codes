import type {SocialNetworks} from './SocialNetworks.ts';
import type {ContentLink} from './ContentLink.ts';
import type {UtterancesConfig} from './UtterancesConfig.ts';

export interface Config {
  socialNetworks: SocialNetworks;
  footerLinks: ContentLink[];
  headerLinks: ContentLink[];
  utterances: UtterancesConfig;
  author: AuthorConfig;
  site: SiteConfig;
  manifest: ManifestConfig;
}

export interface AuthorConfig {
  name: string;
  handle: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  logo: string;
  pageSize: number;
  homePageSize: number;
}

export interface ManifestConfig {
  backgroundColor: string;
  themeColor: string;
  display: string;
  iconSizes: number[];
  icon: string;
}
