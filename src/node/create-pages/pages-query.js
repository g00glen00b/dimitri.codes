exports.pagesQuery = `
  query {
    allTags: allMarkdownRemark {
      group(field: {fields: {tags: name: SELECT}}}) {
        field
        fieldValue
        totalCount
      }
    }
    allCategories: allMarkdownRemark {
      group(field: {fields: {categories: name: SELECT}}}) {
        field
        fieldValue
        totalCount
      }
    }
    allPosts: allMarkdownRemark {
      nodes {
        id
        fields {
          slug
        }
      }
    }
  }
`;