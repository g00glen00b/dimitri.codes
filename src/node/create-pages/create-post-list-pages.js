const path = require('path');
const {createPaginationPages} = require('./create-pagination-pages');

exports.createPostListPages = ({allPosts}, createPage) => createPaginationPages(
  path.resolve('./src/templates/posts.js'),
  allPosts.nodes.length,
  '/posts',
  {},
  createPage
);