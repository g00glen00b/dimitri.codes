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

function createPostPages({allWordpressPost}, createPage) {
  return allWordpressPost.edges.map(({node}) => createPage({
    path: node.slug,
    component: path.resolve('./src/templates/post.js'),
    context: {id: node.id}
  }));
}

function createPagePages({allWordpressPage}, createPage) {
  return allWordpressPage.edges.map(({node}) => createPage({
    path: node.slug,
    component: path.resolve('./src/templates/page.js'),
    context: {id: node.id}
  }));
}

function createPostsPages({allWordpressPost}, createPage) {
  return createPaginationPages(
    path.resolve('./src/templates/posts.js'),
    allWordpressPost.edges.length,
    '/posts',
    {},
    createPage
  );
}

function createCategoryPostsPages({allWordpressCategory}, createPage) {
  return allWordpressCategory.edges.map(({node}) => createPaginationPages(
    path.resolve('./src/templates/categoryPosts.js'),
    node.count,
    `/category/${node.slug}`,
    node,
    createPage
  ));
}

function createTagPostsPages({allWordpressTag}, createPage) {
  return allWordpressTag.edges.map(({node}) => createPaginationPages(
    path.resolve('./src/templates/tagPosts.js'),
    node.count,
    `/tag/${node.slug}`,
    node,
    createPage
  ));
}

module.exports = {
  createTagPostsPages,
  createPostsPages,
  createPagePages,
  createCategoryPostsPages,
  createPostPages
};
