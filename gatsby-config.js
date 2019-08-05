const readingTime = require('reading-time');
const environment = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development';
require('dotenv').config({path: `.env.${environment}`});

module.exports = {
  siteMetadata: {
    title: `Dimitri's tutorials`,
    description: `Dimitri's tutorials about software development with Java and JavaScript`,
    author: `@g00glen00b`,
    siteUrl: process.env.SITE_URL
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        baseUrl: process.env.WORDPRESS_API_HOST,
        protocol: process.env.WORDPRESS_API_PROTOCOL,
        hostingWPCOM: false,
        useACF: false,
        perPage: 100,
        concurrentRequests: 10,
        includedRoutes: [
          `**/categories`,
          `**/posts`,
          `**/pages`,
          `**/media`,
          `**/tags`,
          `**/taxonomies`
        ],
        excludedRoutes: [],
        normalizer: ({entities}) => entities.map(normalize)
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      trackingId: process.env.GOOGLE_TRACKING_ID,
      head: false,
      anonymize: true,
      respectDNT: true
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-advanced-sitemap`,
    `gatsby-plugin-offline`,
    // `gatsby-plugin-feed`,
  ],
};

const normalize = ({content, ...rest}) => {
  if (content != null) {
    const newContent = content
      .replace(new RegExp(process.env.URL_REPLACEMENT_FROM, 'g'), process.env.URL_REPLACEMENT_TO)
      .replace(new RegExp(process.env.IMAGE_REPLACEMENT_FROM, 'g'), process.env.IMAGE_REPLACEMENT_TO);
    return {content: newContent, readingTime: readingTime(content), ...rest};
  } else {
    return {...rest};
  }
};
