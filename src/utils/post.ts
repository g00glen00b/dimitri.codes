import type {CollectionEntry} from 'astro:content';
import type {Post} from '../models/Post.ts';
import readingTime from 'reading-time';
import type {Category} from '../models/Category.ts';
import type {Tag} from '../models/Tag.ts';
import {compareByProperty, groupByArrayProperty, sliceIntoPages} from './array.ts';
import type {CollectionPage} from '../models/CollectionPage.ts';
import type {Group} from '../models/Group.ts';
import { isFuture } from "date-fns"

const pathRegex: RegExp = /^\d{4}\/(\d{4})-(\d{2})-(\d{2})-(.+?)$/;

export function mapToSortedPosts(entries: CollectionEntry<"posts">[]): Post[] {
  return entries
    .map(mapToPost)
    .filter(isPublished)
    .sort(compareByProperty(post => post.publishedDate))
    .reverse();
}

export function mapToCollectionPosts<G>(entries: CollectionEntry<"posts">[], mapper: (post: Post) => G[], pageSize: number): Group<G, CollectionPage<Post>>[] {
  const groups = groupByArrayProperty(mapToSortedPosts(entries), mapper);
  return groups.map(({group, results}) => ({group, results: sliceIntoPages(results, pageSize)}));
}

export function mapToPost(entry: CollectionEntry<"posts">): Post {
  const matches = pathRegex.exec(entry.slug as string);
  if (matches == null) throw 'Could not map';
  const [, year, month, day, slug] = matches;
  const publishedDate: Date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const time = readingTime(entry.body);
  const categories: Category[] = (entry.data.categories || []).map((name: string) => ({name, path: kebabCase(name)}));
  const tags: Tag[] = (entry.data.tags || []).map((name: string) => ({name, path: kebabCase(name)}));
  return {
    slug,
    excerpt: entry.data.excerpt,
    categories,
    title: entry.data.title,
    publishedDate,
    featuredImage: entry.data.featuredImage,
    tags,
    readingTime: time,
    entry,
  }
}

export function kebabCase(name: string) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

export function isPublished(post: Post): boolean {
  return true;
  // TODO: Temporarily disabled during Advent of Spring to avoid having to rebuild every day
  // return import.meta.env.DEV || !isFuture(post.publishedDate);
}