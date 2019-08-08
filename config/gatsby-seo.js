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
        simpleExcerpt
        slug
        title
        date
      }
    }
  }
}`;

const getFeedItem = (site, node) => ({
  description: node.excerpt,
  title: node.title,
  date: node.date,
  url: site.siteMetadata.siteUrl + node.slug,
  guid: site.siteMetadata.siteUrl + node.slug
});

module.exports = [
  {
    resolve: `gatsby-plugin-prefetch-google-fonts`,
    options: {
      fonts: [{
        family: `Roboto`,
        variants: [`300`, `400`, `500`]
      }, {
        family: `Roboto Mono`,
        variants: [`400`, `700`]
      }]
    }
  },
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
];
