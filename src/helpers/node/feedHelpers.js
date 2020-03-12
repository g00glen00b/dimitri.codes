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
  allWordpressPost(sort: {fields: [date], order:DESC}, limit: 10) {
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



function getFeedItem(site, node) {
  return {
    description: node.excerpt,
    title: node.title,
    date: node.date,
    url: `${site.siteMetadata.siteUrl}/${node.slug}`,
    guid: `${site.siteMetadata.siteUrl}/${node.slug}`
  };
}

module.exports = {siteMetadataQuery, feedItemQuery, getFeedItem};
