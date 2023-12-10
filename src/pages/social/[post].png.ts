import type {APIContext} from 'astro';
import {getCollection} from 'astro:content';
import {mapToSortedPosts} from '../../utils/post.ts';
import {generateImage} from '../../utils/image.ts';

export async function GET(context: APIContext) {
  const slug = context.params.post;
  const entries = await getCollection('posts');
  const posts = mapToSortedPosts(entries);
  const post = posts.find(post => post.slug === slug);
  if (post == null) return new Response(null, {status: 404, statusText: 'Not found'});
  const image: ArrayBuffer = await generateImage(post);
  return new Response(image, {
    headers: {'Content-Type': 'image/png'},
  });
}

export async function getStaticPaths() {
  const entries = await getCollection('posts');
  const posts = mapToSortedPosts(entries);
  return posts.map(post => ({params: {post: post.slug}}));
}