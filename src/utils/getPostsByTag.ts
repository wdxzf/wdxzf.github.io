import { dealLabel } from './dealLabel';
import type { BlogEntry } from '@/types/content';

const getPostsByTag = (posts: BlogEntry[], tag: string) =>
  posts.filter((post) => dealLabel(post.data.tags).includes(tag))
export default getPostsByTag;
