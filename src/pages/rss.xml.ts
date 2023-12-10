import rss from '@astrojs/rss';
import {CONFIG} from '../config/config.ts';
import {getCollection} from "astro:content";
import type {APIContext} from 'astro';
import {mapToSortedPosts} from '../utils/post.ts';

export async function GET(context: APIContext) {
  const entries = await getCollection('posts');
  const posts = mapToSortedPosts(entries).slice(0, 10);
  return rss({
    title: CONFIG.site.title,
    description: CONFIG.site.description,
    site: context.site || CONFIG.site.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: post.publishedDate,
      link: post.slug,
    }))
  });
}