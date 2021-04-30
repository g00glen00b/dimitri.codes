const {createSocialCard} = require('./src/helpers/node/socialCardHelpers');
const {createSlug} = require('./src/helpers/node/slugHelpers');
const {createLegacyCategoryTutorialsPage, createPostPages, createCategoryPostsPages, createPostsPages, createTagPostsPages} = require('./src/helpers/node/createPageHelpers');

const allPostsQuery = `
  query {
    allTags: allMarkdownRemark {
      group(field: frontmatter___tags) {
        field
        fieldValue
        totalCount
      }
    }
    allCategories: allMarkdownRemark {
      group(field: frontmatter___categories) {
        field
        fieldValue
        totalCount
      }
    }
    allPosts: allMarkdownRemark {
      edges {
        node {
          id
          fields {
            slug
          }
        }
      }
    }
  }
`;

exports.createPages = async ({graphql, actions: {createPage}}) => {
  const {data, errors} = await graphql(allPostsQuery);
  if (errors) throw errors;
  return [
    createPostPages(data, createPage),
    createPostsPages(data, createPage),
    createCategoryPostsPages(data, createPage),
    createTagPostsPages(data, createPage),

    // Legacy /category/t
    createLegacyCategoryTutorialsPage(data, createPage)
  ];
};

exports.onCreateNode = async ({node, actions, store, cache, createNodeId}) => {
  createSlug(node, actions);
  await createSocialCard(node, actions, store, cache, createNodeId);
};
