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
    let socialCardNode = await createFileNodeFromBuffer({
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
  const width = 1200;
  const height = 600;
  const padding = 40;
  const iconSize = 24;
  const shadowDistance = 20;
  const titleLineHeight = 60;
  const logoWidth = 250;
  const logoHeight = 125;
  registerFont(join('src', 'social-card', 'Montserrat-Bold.ttf'), {family: 'Montserrat', weight: '700'});
  registerFont(join('src', 'social-card', 'Roboto-Regular.ttf'), {family: 'Roboto', weight: '400'});
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  fillBackground(context, '#f3f3f9', width, height);
  showBox(context, '#ffffff', '#2d3452', padding, padding, width - 2 * padding, height - 2 * padding, shadowDistance);
  showText(context, 'bold 40pt Montserrat', '#051923', title, padding * 2, padding * 2 + 50, width - 4 * padding, titleLineHeight);
  await showImage(context, join('src', 'social-card', 'calendar-outline.png'), padding * 2, padding * 2 + titleLineHeight * 3 + 20, iconSize, iconSize);
  showText(context, '16pt Roboto', '#051923', publishDate, padding * 2 + iconSize + 20, padding * 2 + titleLineHeight * 3 + 39, width - 4 * padding, 20);
  await showImage(context, join('src', 'social-card', 'stopwatch.png'), padding * 2, padding * 2 + titleLineHeight * 3 + 70, iconSize, iconSize);
  showText(context, '16pt Roboto', '#051923', `${minutesRead} minute read`, padding * 2 + iconSize + 20, padding * 2 + titleLineHeight * 3 + 89, width - 4 * padding, 20);
  await showImage(context, join('src', 'social-card', 'tag.png'), padding * 2, padding * 2 + titleLineHeight * 3 + 120, iconSize, iconSize);
  if (tags != null && tags.length > 0) {
    showText(context, '16pt Roboto', '#051923', tags.join(', '), padding * 2 + iconSize + 20, padding * 2 + titleLineHeight * 3 + 139, width - 4 * padding, 20);
    await showImage(context, join('src', 'social-card', 'logo.png'), width - padding * 2 - shadowDistance - logoWidth, height - padding - shadowDistance - logoHeight, logoWidth, logoHeight);
  }
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

function showText(context, font, color, text, x, y, width, lineHeight) {
  context.font = font;
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  const words = text.split(' ');
  let currentLine = '';
  let currentY = y;
  for (let index = 0; index < words.length; index++) {
    const testLine = currentLine + words[index] + ' ';
    const {width: testWidth} = context.measureText(testLine);
    if (testWidth > width) {
      context.fillText(currentLine, x, currentY);
      currentY += lineHeight;
      currentLine = words[index] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  context.fillText(currentLine, x, currentY);
}

async function showImage(context, path, x, y, width, height) {
  const image = await loadImage(path);
  context.drawImage(image, x, y, width, height);
}

module.exports = {createSocialCard, generateImage};