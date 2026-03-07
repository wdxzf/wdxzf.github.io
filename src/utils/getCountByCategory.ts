import { compact, countBy } from 'lodash-es';
import { dealLabel } from './dealLabel';
import type { BlogEntry } from '@/types/content';

const getCountByCategory = (posts: BlogEntry[]) => {
  let category: string[] = [];
  const filteredPosts = posts.filter(({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  });
  filteredPosts.forEach((post) => {
    category = compact([...category, ...dealLabel(post.data.category)])
  });
  const result = countBy(category);
  if (result['uncategorized']) {
    const num = result['uncategorized']
    delete result['uncategorized']
    result['uncategorized'] = num
  }
  return result;
};

export default getCountByCategory;
