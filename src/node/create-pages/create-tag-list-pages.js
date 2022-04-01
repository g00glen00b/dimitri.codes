const {createPaginationPages} = require('./create-pagination-pages');
const path = require('path');
const {kebabCase} = require('../create-node-field/kebab-case');

exports.createTagListPages = ({allTags}, createPage) => {
  allTags.group.forEach(group => createPaginationPages(
    path.resolve('./src/templates/tagPosts.js'),
    group.totalCount,
    `/tag/${kebabCase(group.fieldValue)}`,
    group,
    createPage
  ));
}