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
  allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, limit: 10) {
    nodes {
      excerpt(format: PLAIN)
      slug
      frontmatter {
        title
        date
      }
    }
  }
}`;



function getFeedItem(site, node) {
  return {
    description: node.excerpt,
    title: node.frontmatter.title,
    date: node.frontmatter.date,
    url: `${site.siteMetadata.siteUrl}/${node.slug}`,
    guid: `${site.siteMetadata.siteUrl}/${node.slug}`
  };
}

module.exports = {siteMetadataQuery, feedItemQuery, getFeedItem};
