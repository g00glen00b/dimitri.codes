exports.createSlug = (node, {createNodeField}) => {
  if (node.fileAbsolutePath != null) {
    const matcher = /(posts|pages)\/(\d{4}\/)?(\d{4}-\d{2}-\d{2}-)?(.+?)\/index\.md$/;
    const [,,,, slug] = node.fileAbsolutePath.match(matcher) || [];
    createNodeField({node, name: 'slug', value: slug});
  }
}
