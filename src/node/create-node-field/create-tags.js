const {kebabCase} = require('./kebab-case');

exports.createTags = (node, {createNodeField}) => {
  if (node.frontmatter != null && node.frontmatter.tags != null) {
    const tagObjects = node.frontmatter.tags.map(tag => ({
      name: tag,
      path: kebabCase(tag)
    }));
    createNodeField({node, name: 'tags', value: tagObjects});
  }
}