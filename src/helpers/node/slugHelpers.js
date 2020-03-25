function createSlug(node, {createNodeField}) {
  if (node.fileAbsolutePath != null) {
    const matcher = /posts\/\d{4}-\d{2}-\d{2}-(.+?)\/index.md$/;
    const [, slug] = node.fileAbsolutePath.match(matcher) || [];
    if (slug) {
      createNodeField({
        node,
        name: 'slug',
        value: slug
      });
    }
  }
}

module.exports = {createSlug};
