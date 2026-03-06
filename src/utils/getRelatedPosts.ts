import dayjs from 'dayjs';

type Entry = {
  slug: string;
  data: {
    title?: string;
    date?: string | Date;
    tags?: string[] | string | null;
    category?: string[] | string | null;
  };
};

function normalizeLabel(value: string[] | string | null | undefined) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getRelatedPosts(posts: Entry[], currentSlug: string, limit = 3) {
  const currentPost = posts.find((post) => post.slug === currentSlug);

  if (!currentPost) {
    return [];
  }

  const currentTags = new Set(normalizeLabel(currentPost.data.tags));
  const currentCategories = new Set(
    normalizeLabel(currentPost.data.category).filter((item) => item !== 'uncategorized')
  );

  return posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const postTags = normalizeLabel(post.data.tags);
      const postCategories = normalizeLabel(post.data.category).filter(
        (item) => item !== 'uncategorized'
      );
      const sharedTagCount = postTags.filter((tag) => currentTags.has(tag)).length;
      const sharedCategoryCount = postCategories.filter((item) =>
        currentCategories.has(item)
      ).length;

      return {
        post,
        score: sharedTagCount * 4 + sharedCategoryCount * 3,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return dayjs(b.post.data.date).unix() - dayjs(a.post.data.date).unix();
    })
    .slice(0, limit)
    .map((item) => item.post);
}
