import { compact, countBy } from 'lodash-es';
import { dealLabel } from './dealLabel';
import type { BlogEntry } from '@/types/content';

const getCountByTagName = (posts: BlogEntry[]) => {
  let tags: string[] = [];
  const filteredPosts = posts.filter(({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  });
  filteredPosts.forEach((post) => {
    tags = compact([...tags, ...dealLabel(post.data.tags)])
  });
  return countBy(tags);
};

export default getCountByTagName;
