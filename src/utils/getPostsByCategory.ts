import { dealLabel } from './dealLabel';
import type { BlogEntry } from '@/types/content';

const getPostsByCategory = (posts: BlogEntry[], category: string) =>
  posts.filter((post) => dealLabel(post.data.category).includes(category))

export default getPostsByCategory;
