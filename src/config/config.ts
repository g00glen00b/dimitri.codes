import type {Config} from '../models/Config.ts';

export const CONFIG: Config = {
  socialNetworks: {
    linkedin: 'g00glen00b',
    github: 'g00glen00b',
    codepen: 'g00glen00b',
    speakerdeck: 'g00glen00b',
  },
  footerLinks: [
    {name: 'Privacy policy', to: '/privacy-policy', external: false},
    {name: 'Post an idea', to: '/post-ideas', external: false},
    {name: 'Contact', to: '/contact', external: false},
    {name: 'RSS', to: '/rss.xml', external: true},
  ],
  headerLinks: [
    {name: 'Home', to: '/', external: false},
    {name: 'Tutorials', to: '/category/tutorials', external: false},
    {name: 'Speaking', to: '/speaking', external: false},
    {name: 'About me', to: '/about-me', external: false},
  ],
  utterances: {
    issueTerm: 'url',
    label: 'type: comments',
    theme: 'github-light',
    repository: 'g00glen00b/dimitri.codes',
  },
  author: {
    name: 'Dimitri Mestdagh',
    handle: 'g00glen00b',
  },
  site: {
    title: 'Dimitri\'s tutorials',
    description: 'Dimitri\'s tutorials about software development with Java and JavaScript',
    url: 'https://dimitri.codes',
    logo: '/logo-square.png',
    pageSize: 10,
    homePageSize: 10,
    clickyId: 101423246,
  },
  manifest: {
    backgroundColor: '#FFFFFF',
    themeColor: '#3E84CB',
    display: 'standalone',
    iconSizes: [48, 72, 96, 144, 192, 256, 384, 512],
    icon: 'src/icons/logo.svg',
  },
}