function findSlug(node) {
  if (node.fileAbsolutePath != null) {
    const matcher = /posts\/\d{4}-\d{2}-\d{2}-(.+?)\/index.md$/;
    const [, slug] = node.fileAbsolutePath.match(matcher) || [];
    return slug;
  }
}

module.exports = {findSlug};
