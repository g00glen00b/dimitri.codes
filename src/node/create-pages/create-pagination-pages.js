function createNumberedPages(pageCount, createPage, base, component, pageSize, context) {
  Array.from({length: pageCount}).forEach((_, index) => createPage({
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
}

function createFirstUnnumberedPage(pageCount, createPage, base, component, pageSize, context) {
  if (pageCount > 0) {
    createPage({
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
  }
}

exports.createPaginationPages = (component, totalItems, base, context, createPage, pageSize = 10) => {
  const pageCount = Math.ceil(totalItems / pageSize);
  createNumberedPages(pageCount, createPage, base, component, pageSize, context);
  createFirstUnnumberedPage(pageCount, createPage, base, component, pageSize, context);
}