import { config } from "../consts";
import {getCollectionByName} from "../utils/getCollectionByName.js";
import {getPostPlainText, truncateText} from "../utils/getPostPlainText.js";
import {
  getInterviewPath,
  getInterviewStats,
  getVisibleInterviewEntries,
  isInterviewIndexEntry,
  sortInterviewEntries,
} from '@/utils/interview';

async function getBlogs() {
  const blog = await getCollectionByName('blog')
  return blog.map(blog => {
    const content = getPostPlainText(blog.body);
    const description = blog.data.description ?? '';
    const includeContent = config.search.includeContent;

    return {
      type: 'blog',
      slug: blog.slug,
      href: `/blog/${blog.slug}`,
      title: blog.data.title,
      description,
      date: blog.data.date,
      category: blog.data.category,
      tags: blog.data.tags,
      excerpt: truncateText(description || content, 220),
      ...(includeContent ? { content } : {}),
    }
  })
}

async function getFeeds() {
  const feed = await getCollectionByName('feed')

  return feed.map(feed => {
    const content = getPostPlainText(feed.body);
    const title = feed.data.title ?? (content.slice(0, 28) || '动态');

    return {
      type: 'feed',
      slug: feed.slug,
      href: `/feed/${feed.slug}`,
      title,
      description: '',
      date: feed.data.date,
      excerpt: truncateText(content, 220),
      content,
    }
  })
}

async function getWikiDocuments() {
  const entries = sortInterviewEntries(await getVisibleInterviewEntries());

  return entries
    .filter((entry) => !isInterviewIndexEntry(entry))
    .map((entry) => {
      const content = getPostPlainText(entry.body);
      const description = entry.data.description ?? '';
      const stats = getInterviewStats(entry.body);

      return {
        type: 'wiki',
        slug: entry.slug,
        href: getInterviewPath(entry),
        title: entry.data.title,
        description,
        section: entry.data.section ?? '',
        order: entry.data.order ?? 0,
        questionCount: stats.questionCount,
        wordCount: stats.wordCount,
        excerpt: truncateText(description || content, 220),
        content,
      };
    });
}

export async function GET({}) {
  const documents = [
    ...(await getBlogs()),
    ...(await getFeeds()),
    ...(await getWikiDocuments()),
  ];

  return new Response(JSON.stringify(documents), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
