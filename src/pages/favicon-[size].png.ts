import sharp from 'sharp';
import path from 'node:path';
import type {APIContext} from 'astro';
import {CONFIG} from '../config/config.ts';

const favicon = path.resolve(CONFIG.manifest.icon);

export async function GET(context: APIContext) {
  const size = parseInt(context.params.size!);
  const buffer = await sharp(favicon).resize(size).toFormat('png').toBuffer();
  return new Response(buffer, {
    headers: {'Content-Type': 'image/png'},
  });
}

export async function getStaticPaths() {
  return CONFIG.manifest.iconSizes.map(size => ({params: {size}}));
}