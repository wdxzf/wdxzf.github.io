import dayjs from 'dayjs';
import type { BlogEntry, YearGroupedPosts } from '@/types/content';

const getPostsByYear = (posts: BlogEntry[]): YearGroupedPosts => {
  const groupedPosts: YearGroupedPosts = {};

  posts.forEach((post) => {
    const postCreateYear = dayjs(post.data.date).format("YYYY");
    groupedPosts[postCreateYear] = [...(groupedPosts[postCreateYear] ?? []), post];
  });

  return groupedPosts;
};
export default getPostsByYear;
