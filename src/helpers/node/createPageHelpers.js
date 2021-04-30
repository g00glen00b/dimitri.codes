const {kebabCase} = require('../contentHelpers');
const path = require('path');

function createPaginationPages(component, totalItems, base, context, createPage) {
  const pageSize = 10;
  const pageCount = Math.ceil(totalItems / pageSize);
  const pages = Array.from({length: pageCount}).map((_, index) => createPage({
    path: `${base}/page/${index + 1}`,
    component,
    context: {
      base,
      limit: pageSize,
      skip: index * pageSize,
      pageCount,
      currentPage: index + 1,
      ...context
    },
  }));
  const firstPage = pageCount > 0 && createPage({
    path: base,
    component,
    context: {
      base,
      limit: pageSize,
      skip: 0,
      pageCount,
      currentPage: 1,
      ...context
    }
  });
  return [...pages, firstPage];
}

function createPostPages({allPosts}, createPage) {
  return allPosts.edges.map(({node}) => createPage({
    path: node.fields.slug,
    component: path.resolve('./src/templates/post.js'),
    context: {id: node.id}
  }));
}

function createPostsPages({allPosts}, createPage) {
  return createPaginationPages(
    path.resolve('./src/templates/posts.js'),
    allPosts.edges.length,
    '/posts',
    {},
    createPage
  );
}

function createCategoryPostsPages({allCategories}, createPage) {
  return allCategories.group.map(group => createPaginationPages(
    path.resolve('./src/templates/categoryPosts.js'),
    group.totalCount,
    `/category/${kebabCase(group.fieldValue)}`,
    group,
    createPage
  ));
}

function createTagPostsPages({allTags}, createPage) {
  return allTags.group.map(group => createPaginationPages(
    path.resolve('./src/templates/tagPosts.js'),
    group.totalCount,
    `/tag/${kebabCase(group.fieldValue)}`,
    group,
    createPage
  ));
}

function createLegacyCategoryTutorialsPage({allCategories}, createPage) {
  return allCategories.group
    .filter(({fieldValue}) => fieldValue === 'Tutorials')
    .map(group => createPaginationPages(
      path.resolve('./src/templates/categoryPosts.js'),
      group.totalCount,
      `/category/t`,
      group,
      createPage
    ));
}

module.exports = {
  createPaginationPages,
  createTagPostsPages,
  createPostsPages,
  createCategoryPostsPages,
  createPostPages,
  createLegacyCategoryTutorialsPage
};
