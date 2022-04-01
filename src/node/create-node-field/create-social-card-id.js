exports.createSocialCardId = (node, socialCardNode, {createNodeField}) => {
  if (socialCardNode != null) {
    createNodeField({
      node,
      name: 'socialCardId',
      value: socialCardNode.id
    });
  }
}