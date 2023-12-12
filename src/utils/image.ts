import type {Post} from '../models/Post.ts';
import {CanvasRenderingContext2D, createCanvas, loadImage, registerFont} from 'canvas';
import {format} from 'date-fns';

export async function generateImage(post: Post) {
  registerFont('src/utils/assets/Montserrat-Bold.ttf', {family: 'Montserrat', weight: '700'});
  registerFont('src/utils/assets/Roboto-Regular.ttf', {family: 'Roboto', weight: '400'});
  const canvas = createCanvas(1200, 600);
  const context = canvas.getContext('2d');
  fillBackground(context, '#f3f3f9', 1200, 600);
  showBox(context, '#ffffff', '#2d3452', 60, 60, 1080, 480);
  context.font = 'bold 40pt Montserrat';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  showText(context, post.title, 80, 130, 1040, 60);
  context.font = '25pt Roboto';
  context.textAlign = 'left';
  context.fillStyle = '#051923';
  if (post.publishedDate != null) {
    await showImage(context, 'src/utils/assets/calendar-outline.png', 80, 280, 48, 48);
    showText(context, format(post.publishedDate, 'MMMM do, yyyy'), 150, 318, 680, 30);
  }
  await showImage(context, 'src/utils/assets/stopwatch.png', 80, 350, 48, 48);
  showText(context, `${Math.round(post.readingTime.minutes)} minute read`, 150, 388, 680, 30);
  if (post.tags != null && post.tags.length > 0) {
    await showImage(context, 'src/utils/assets/tag.png', 80, 420, 48, 48);
    showText(context, post.tags.map(({name}) => name).join(', '), 150, 458, 680, 30);
  }
  await showImage(context, 'src/utils/assets/logo-square.png', 975, 415, 125, 125);
  return canvas.toBuffer('image/png');
}

function fillBackground(context: CanvasRenderingContext2D, color: string, width: number, height: number) {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}

function showBox(context: CanvasRenderingContext2D, backgroundColor: string, borderColor: string, x: number, y: number, width: number, height: number) {
  const shadowDistance = 20;
  context.fillStyle = borderColor;
  context.fillRect(x + shadowDistance, y + shadowDistance, width, height);
  context.fillStyle = backgroundColor;
  context.strokeStyle = borderColor;
  context.lineWidth = 4;
  context.fillRect(x, y, width, height);
  context.strokeRect(x, y, width, height);
}

function showText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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

async function showImage(context: CanvasRenderingContext2D, path: string, x: number, y: number, width: number, height: number) {
  const image = await loadImage(path);
  context.drawImage(image, x, y, width, height);
}