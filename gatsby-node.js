const {createSlug} = require('./src/helpers/node/slugHelpers');
const {createPostPages, createPostsPages, createCategoryPostsPages, createTagPostsPages,
  createLegacyCategoryTutorialsPage
} = require('./src/helpers/node/createPageHelpers');
const {createSocialCard} = require('./src/helpers/node/socialCardHelpers');

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

exports.onCreateNode = async ({node, actions, store, getCache, createNodeId}) => {
  createSlug(node, actions);
  await createSocialCard(node, actions, store, getCache, createNodeId);
};

exports.createResolvers = ({ createResolvers }) => createResolvers({
  MarkdownRemark: {
    socialCard: {
      type: `File`,
      resolve: (source, args, context) => context.nodeModel.findOne({type: `File`, query: {filter: {id: {eq: source.fields.socialCardId}}}})
    }
  }
});