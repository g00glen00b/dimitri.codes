const readingTime = require('reading-time');
const environment = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development';
require('dotenv').config({path: `.env.${environment}`});

const siteMetadataQuery = `{
  site {
    siteMetadata {
      title
      description
      siteUrl
      site_url: siteUrl
    }
  }
}`;

const feedItemQuery = `{
  allWordpressPost(sort: {fields: [date], order:DESC}) {
    edges {
      node {
        excerpt
        slug
        title
        date
      }
    }
  }
}`;

const getFeedItem = (siteMetadata, node) => ({
  description: node.excerpt,
  title: node.title,
  date: node.date,
  url: siteMetadata.siteUrl + node.slug,
  guid: siteMetadata.siteUrl + node.slug
});


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

module.exports = {
  siteMetadata: {
    title: `Dimitri's tutorials`,
    description: `Dimitri's tutorials about software development with Java and JavaScript`,
    author: `@g00glen00b`,
    siteUrl: process.env.SITE_URL,
    siteOrigin: new Date('2012-07-01')
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
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-advanced-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: siteMetadataQuery,
        feeds: [{
          serialize: ({query: {site, allWordpressPost}}) => allWordpressPost.edges.map(({node}) => getFeedItem(site, node)),
          query: feedItemQuery,
          output: `/rss.xml`,
          title: `Dimitri's tutorial RSS feed`
        }]
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dimitri's tutorials`,
        short_name: `Dimitri\'s tutorials`,
        start_url: `/`,
        background_color: `#FFFFFF`,
        theme_color: `#55BABF`,
        display: `standalone`,
        icon: `src/images/logo.png`
      }
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      trackingId: process.env.GOOGLE_TRACKING_ID,
      head: false,
      anonymize: true,
      respectDNT: true
    },
  ],
};
