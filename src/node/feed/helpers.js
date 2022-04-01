exports.siteMetadataQuery = `{
  site {
    siteMetadata {
      title
      description
      siteUrl
      site_url: siteUrl
    }
  }
}`;

exports.feedItemQuery = `{
  allMarkdownRemark(sort: {fields: fields___postDate, order: DESC}, limit: 10) {
    nodes {
      excerpt(format: PLAIN)
      fields {
        slug
      }
      frontmatter {
        title
        date
      }
    }
  }
}`;



exports.getFeedItem = (site, node) => ({
  description: node.excerpt,
  title: node.frontmatter.title,
  date: node.frontmatter.date,
  url: `${site.siteMetadata.siteUrl}/${node.fields.slug}`,
  guid: `${site.siteMetadata.siteUrl}/${node.fields.slug}`
});
