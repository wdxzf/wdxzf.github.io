import dayjs from 'dayjs'
import type { DatedEntry } from '@/types/content';

export const sortPostsByDate = <T extends DatedEntry>(posts: T[]) =>
  [...posts]
    .filter(({ data }) => {
      if (!import.meta.env.PROD) {
        return true;
      }

      return 'draft' in data ? !data.draft : true;
    })
    .sort(
      (a, b) =>
        dayjs(b.data.date ?? 0).valueOf() - dayjs(a.data.date ?? 0).valueOf()
    );
