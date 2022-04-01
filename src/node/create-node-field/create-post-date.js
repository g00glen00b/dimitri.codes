exports.createPostDate = (node, {createNodeField}) => {
  if (node.fileAbsolutePath != null) {
    const matcher = /posts\/\d{4}\/(\d{4}-\d{2}-\d{2})-.+?\/index\.md$/;
    const [, date] = node.fileAbsolutePath.match(matcher) || [];
    createNodeField({node, name: 'postDate', value: date || '0001-01-01'});
  }
}