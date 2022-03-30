const {findSlug, findPostDate, createSlug, createPostDate} = require('./src/helpers/node/slugHelpers');
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
      nodes {
        id
        slug
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
  await createSocialCard(node, actions, store, getCache, createNodeId);
  createSlug(node, actions);
  createPostDate(node, actions);
};

exports.createSchemaCustomization = ({actions}) => {
  const {createTypes} = actions;
  createTypes(`type MarkdownRemark implements Node {
    socialCard: File @link(from: "fields.socialCardId")
  }`);
};