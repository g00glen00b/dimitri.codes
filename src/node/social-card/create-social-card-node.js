const readingTime = require('reading-time');
const format = require('date-fns/format');
const {createFileNodeFromBuffer} = require('gatsby-source-filesystem');
const {generateImage} = require('./generate-image');

exports.createSocialCardNode = async (node, {createNode}, store, getCache, createNodeId) => {
  if (node.internal.type === 'MarkdownRemark') {
    const {minutes: minutesRead} = readingTime(node.rawMarkdownBody);
    const formattedDate = node.fields.postDate == null ? null : format(new Date(node.fields.postDate), 'MMMM do, yyyy');
    const buffer = await generateImage(node.frontmatter.title, formattedDate, Math.floor(minutesRead), node.frontmatter.tags);
    return await createFileNodeFromBuffer({
      buffer,
      createNodeId,
      createNode,
      getCache,
      name: 'social-card'
    });
  }
}