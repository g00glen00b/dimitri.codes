const path = require('path');

exports.createPostPages = ({allPosts}, createPage) => {
  allPosts.nodes.forEach(node => createPage({
    path: node.fields.slug,
    component: path.resolve('./src/templates/post.js'),
    context: {id: node.id}
  }));
}