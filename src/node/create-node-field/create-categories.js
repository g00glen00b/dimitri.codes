const {kebabCase} = require('./kebab-case');

exports.createCategories = (node, {createNodeField}) => {
  if (node.frontmatter != null && node.frontmatter.categories != null) {
    const categoryObjects = node.frontmatter.categories.map(category => ({
      name: category,
      path: kebabCase(category)
    }));
    createNodeField({node, name: 'categories', value: categoryObjects});
  }
}