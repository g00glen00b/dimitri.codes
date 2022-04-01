const {createPostPages} = require('./src/node/create-pages/create-post-pages');
const {createPostListPages} = require('./src/node/create-pages/create-post-list-pages');
const {createCategoryListPages} = require('./src/node/create-pages/create-category-list-pages');
const {createTagListPages} = require('./src/node/create-pages/create-tag-list-pages');
const {createSlug} = require('./src/node/create-node-field/create-slug');
const {createPostDate} = require('./src/node/create-node-field/create-post-date');
const {createSocialCardNode} = require('./src/node/social-card/create-social-card-node');
const {createSocialCardId} = require('./src/node/create-node-field/create-social-card-id');
const {pagesQuery} = require('./src/node/create-pages/pages-query');
const {createTags} = require('./src/node/create-node-field/create-tags');
const {createCategories} = require('./src/node/create-node-field/create-categories');


exports.createPages = async ({graphql, actions: {createPage}}) => {
  const {data, errors} = await graphql(pagesQuery);
  if (errors) throw errors;
  createPostPages(data, createPage);
  createPostListPages(data, createPage);
  createCategoryListPages(data, createPage);
  createTagListPages(data, createPage);
};

exports.onCreateNode = async ({node, actions, store, getCache, createNodeId}) => {
  createSlug(node, actions);
  createPostDate(node, actions);
  createTags(node, actions);
  createCategories(node, actions);
  const socialCardNode = await createSocialCardNode(node, actions, store, getCache, createNodeId);
  createSocialCardId(node, socialCardNode, actions);
};

exports.createSchemaCustomization = ({actions}) => {
  const {createTypes} = actions;
  createTypes(`type MarkdownRemark implements Node {
    socialCard: File @link(from: "fields.socialCardId")
  }`);
};