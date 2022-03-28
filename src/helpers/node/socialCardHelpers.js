const {createCanvas, loadImage, registerFont} = require('canvas');
const {join} = require('path');
const readingTime = require('reading-time');
const format = require('date-fns/format');
const {createFileNodeFromBuffer} = require("gatsby-source-filesystem");

async function createSocialCard(node, {createNode, createNodeField, createParentChildLink}, store, getCache, createNodeId) {
  if (node.internal.type === 'MarkdownRemark') {
    const {minutes: minutesRead} = readingTime(node.rawMarkdownBody);
    const formattedDate = format(new Date(node.frontmatter.date), 'MMMM do, yyyy');
    const buffer = await generateImage(node.frontmatter.title, formattedDate, Math.floor(minutesRead), node.frontmatter.tags);
    const socialCardNode = await createFileNodeFromBuffer({
      buffer,
      createNodeId,
      createNode,
      getCache,
      name: 'social-card'
    });
    createNodeField({
      node,
      name: 'socialCardId',
      value: socialCardNode.id
    });
  }
}

async function generateImage(title, publishDate, minutesRead, tags) {
  registerFont(join('src', 'social-card', 'Montserrat-Bold.ttf'), {family: 'Montserrat', weight: '700'});
  registerFont(join('src', 'social-card', 'Roboto-Regular.ttf'), {family: 'Roboto', weight: '400'});
  const canvas = createCanvas(1200, 600);
  const context = canvas.getContext('2d');
  fillBackground(context, '#f3f3f9', 1200, 600);
  showBox(context, '#ffffff', '#2d3452', 60, 60, 1080, 480);
  context.font = 'bold 40pt Montserrat';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  showText(context, title, 80, 130, 1040, 60);
  context.font = '25pt Roboto';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  await showImage(context, join('src', 'social-card', 'calendar-outline.png'), 80, 280, 48, 48);
  showText(context, publishDate, 150, 318, 680, 30);
  await showImage(context, join('src', 'social-card', 'stopwatch.png'), 80, 350, 48, 48);
  showText(context, `${minutesRead} minute(s) read`, 150, 388, 680, 30);
  if (tags != null && tags.length > 0) {
    await showImage(context, join('src', 'social-card', 'tag.png'), 80, 420, 48, 48);
    showText(context, tags.join(', '), 150, 458, 680, 30);
  }
  await showImage(context, join('src', 'social-card', 'logo.png'), 850, 415, 250, 125);
  return canvas.toBuffer('image/png');
}

function fillBackground(context, color, width, height) {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}

function showBox(context, backgroundColor, borderColor, x, y, width, height) {
  const shadowDistance = 20;
  context.fillStyle = borderColor;
  context.fillRect(x + shadowDistance, y + shadowDistance, width, height);
  context.fillStyle = backgroundColor;
  context.strokeStyle = borderColor;
  context.lineWidth = 4;
  context.fillRect(x, y, width, height);
  context.strokeRect(x, y, width, height);
}

function showText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let currentLine = '';
  let currentY = y;
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const {width: testWidth} = context.measureText(testLine);
    if (testWidth > maxWidth) {
      context.fillText(currentLine, x, currentY);
      currentY += lineHeight;
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  context.fillText(currentLine, x, currentY);
}

async function showImage(context, path, x, y, width, height) {
  const image = await loadImage(path);
  context.drawImage(image, x, y, width, height);
}

module.exports = {createSocialCard, generateImage};
