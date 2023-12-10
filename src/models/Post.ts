import type {Tag} from './Tag.ts';
import type {Category} from './Category.ts';
import type {ReadTimeResults} from 'reading-time';
import type {CollectionEntry} from 'astro:content';

export interface Post {
  categories: Category[];
  tags: Tag[];
  slug: string;
  title: string;
  excerpt: string;
  publishedDate: Date;
  featuredImage: string;
  readingTime: ReadTimeResults;
  entry: CollectionEntry<"posts">;
}