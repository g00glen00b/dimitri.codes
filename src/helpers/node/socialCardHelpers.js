const {createCanvas, loadImage, registerFont} = require('canvas');
const {join} = require('path');
const readingTime = require('reading-time');
const format = require('date-fns/format');
const {createFileNodeFromBuffer} = require("gatsby-source-filesystem");

async function createSocialCard(node, {createNode}, store, cache, createNodeId) {
  if (node.internal.type === 'MarkdownRemark') {
    const {minutes: minutesRead} = readingTime(node.rawMarkdownBody);
    const formattedDate = format(new Date(node.frontmatter.date), 'MMMM do, yyyy');
    const buffer = await generateImage(node.fields.slug, node.frontmatter.title, formattedDate, Math.floor(minutesRead), node.frontmatter.tags);
    const socialCardNode = await createFileNodeFromBuffer({
      buffer,
      createNodeId,
      createNode,
      cache,
      store
    });
    if (socialCardNode != null) {
      node.socialCard___NODE = socialCardNode.id;
    }
  }
}

async function generateImage(name, title, publishDate, minutesRead, tags) {
  registerFont(join('src', 'social-card', 'Montserrat-Bold.ttf'), {family: 'Montserrat', weight: '700'});
  registerFont(join('src', 'social-card', 'Roboto-Regular.ttf'), {family: 'Roboto', weight: '400'});
  const canvas = createCanvas(1200, 600);
  const context = canvas.getContext('2d');
  fillBackground(context, '#f3f3f9', 1200, 600);
  showBox(context, '#ffffff', '#2d3452', 40, 40, 1120, 520, 20);
  context.font = 'bold 40pt Montserrat';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  showText(context, title, 80, 130, 1040, 60);
  await showImage(context, join('src', 'social-card', 'calendar-outline.png'), 80, 260, 24, 24);
  context.font = '16pt Roboto';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  showText(context, publishDate, 124, 299, 821, 20);
  await showImage(context, join('src', 'social-card', 'stopwatch.png'), 80, 330, 24, 24);
  showText(context, `${minutesRead} minute read`, 124, 349, 821, 20);
  if (tags != null && tags.length > 0) {
    await showImage(context, join('src', 'social-card', 'tag.png'), 80, 380, 24, 24);
    showText(context, tags.join(', '), 124, 399, 821, 20);
  }
  await showImage(context, join('src', 'social-card', 'logo.png'), 850, 415, 250, 125);
  return canvas.toBuffer('image/png');
}

function fillBackground(context, color, width, height) {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}

function showBox(context, backgroundColor, borderColor, x, y, width, height, shadowDistance) {
  context.fillStyle = borderColor;
  context.fillRect(x + shadowDistance, y + shadowDistance, width - 2 * shadowDistance, height - 2 * shadowDistance);
  context.fillStyle = backgroundColor;
  context.strokeStyle = borderColor;
  context.lineWidth = '4pt';
  context.fillRect(x, y, width - 2 * shadowDistance, height - 2 * shadowDistance);
  context.strokeRect(x, y, width - 2 * shadowDistance, height - 2 * shadowDistance);
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