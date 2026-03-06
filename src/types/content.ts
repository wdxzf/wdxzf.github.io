import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;
export type FeedEntry = CollectionEntry<'feed'>;
export type DatedEntry = BlogEntry | FeedEntry;
export type LabelValue = string | string[] | null | undefined;
export type YearGroupedPosts = Record<string, BlogEntry[]>;
