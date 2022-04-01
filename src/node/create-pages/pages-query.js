exports.pagesQuery = `
  query {
    allTags: allMarkdownRemark {
      group(field: fields___tags___name) {
        field
        fieldValue
        totalCount
      }
    }
    allCategories: allMarkdownRemark {
      group(field: fields___categories___name) {
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