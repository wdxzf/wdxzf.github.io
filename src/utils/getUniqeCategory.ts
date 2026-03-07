import { compact } from 'lodash-es';
import { dealLabel } from './dealLabel';
import type { BlogEntry } from '@/types/content';

const getUniqueCategory = (posts: BlogEntry[]) => {
  let category: string[] = [];
  const filteredPosts = posts.filter(({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  });
  filteredPosts.forEach((post) => {
    category = [...category, ...dealLabel(post.data.category)]
      .filter(
        (value: string, index: number, self: string[]) =>
          self.indexOf(value) === index
      );
  });
  return compact(category);
};

export default getUniqueCategory;
