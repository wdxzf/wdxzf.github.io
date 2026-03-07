import dayjs from 'dayjs';
import type { BlogEntry } from '@/types/content';

export const orderBySticky = (posts: BlogEntry[]) =>
  [...posts].sort((leftPost, rightPost) => {
    const leftSticky = leftPost.data.sticky ?? 0;
    const rightSticky = rightPost.data.sticky ?? 0;

    if (rightSticky !== leftSticky) {
      return rightSticky - leftSticky;
    }

    return dayjs(rightPost.data.date).valueOf() - dayjs(leftPost.data.date).valueOf();
  });
