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
  allMarkdownRemark(sort: {fields: {postDate: DESC}}, limit: 10) {
    nodes {
      excerpt(format: PLAIN)
      fields {
        slug
        postDate
      }
      frontmatter {
        title
      }
    }
  }
}`;



exports.getFeedItem = (site, node) => ({
  description: node.excerpt,
  title: node.frontmatter.title,
  date: node.fields.postDate,
  url: `${site.siteMetadata.siteUrl}/${node.fields.slug}`,
  guid: `${site.siteMetadata.siteUrl}/${node.fields.slug}`
});
