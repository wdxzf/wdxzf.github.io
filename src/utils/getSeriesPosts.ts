import dayjs from 'dayjs';
import type { BlogEntry } from '@/types/content';

function normalizeSeriesName(value: string | null | undefined) {
  return value?.trim() ?? '';
}

export function getSeriesPosts(posts: BlogEntry[], currentSlug: string) {
  const currentPost = posts.find((post) => post.slug === currentSlug);
  const currentSeries = normalizeSeriesName(currentPost?.data.series);

  if (!currentPost || !currentSeries) {
    return [];
  }

  return posts
    .filter((post) => normalizeSeriesName(post.data.series) === currentSeries)
    .sort((leftPost, rightPost) => {
      const leftOrder = leftPost.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = rightPost.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return dayjs(leftPost.data.date).valueOf() - dayjs(rightPost.data.date).valueOf();
    });
}
