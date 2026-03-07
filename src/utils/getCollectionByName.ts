import { getCollection } from "astro:content";

export const getCollectionByName = async <T extends 'blog' | 'feed'>(name: T) => {
  const posts = await getCollection(name);

  if (!posts || posts.length === 0) {
    return [];
  }

  return posts.filter(({ data }) => {
    if (!import.meta.env.PROD) {
      return true;
    }

    return 'draft' in data ? !data.draft : true;
  });
};
