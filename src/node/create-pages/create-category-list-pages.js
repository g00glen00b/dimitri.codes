const {createPaginationPages} = require('./create-pagination-pages');
const path = require('path');
const {kebabCase} = require('../create-node-field/kebab-case');

exports.createCategoryListPages = ({allCategories}, createPage) => {
  allCategories.group.forEach(group => createPaginationPages(
    path.resolve('./src/templates/categoryPosts.js'),
    group.totalCount,
    `/category/${kebabCase(group.fieldValue)}`,
    group,
    createPage
  ));
}