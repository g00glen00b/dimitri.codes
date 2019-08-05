const readingTime = require('reading-time');

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
        normalizer: ({entities}) => entities.map(wordNormalizer).map(urlNormalizer)
      }
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
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

const wordNormalizer = ({content, ...rest}) => {
  if (content != null) return {content, ...rest, readingTime: readingTime(content)};
  else return {...rest};
};

const urlNormalizer = ({content, ...rest}) => {
  if (content != null) return {content: content.replace(new RegExp(process.env.URL_REPLACEMENT), `${process.env.siteUrl}/`), ...rest};
  else return {...rest};
};
