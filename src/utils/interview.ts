import { getCollection, type CollectionEntry } from 'astro:content';

export type InterviewEntry = CollectionEntry<'interview'>;

export const getVisibleInterviewEntries = async () => {
  return getCollection('interview', ({ data }) => {
    if (!import.meta.env.PROD) {
      return true;
    }

    return !data.draft;
  });
};

export const sortInterviewEntries = (entries: InterviewEntry[]) => {
  return [...entries].sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.slug.localeCompare(b.slug, 'zh-Hans-CN');
  });
};

export const getInterviewPath = (entry: InterviewEntry) => {
  return `/interview/${entry.slug}`;
};

export const isInterviewIndexEntry = (entry: InterviewEntry) => {
  return entry.slug.split('/').pop()?.startsWith('00_') ?? false;
};

export const countInterviewQuestions = (body = '') => {
  const matches = body.match(/^#{2,4}\s*Q\d+[:：\s]/gim);
  return matches?.length ?? 0;
};

export const countReadableWords = (body = '') => {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#[\]()*_>~|:：,，.。!！?？-]/g, ' ');
  const cjkCount = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const wordCount = text
    .replace(/[\u3400-\u9fff]/g, ' ')
    .match(/[A-Za-z0-9_+./-]+/g)?.length ?? 0;

  return cjkCount + wordCount;
};

export const formatInterviewWordCount = (count: number) => {
  if (count >= 1000) {
    return `约 ${Math.round(count / 1000)}k 字`;
  }

  return `约 ${count} 字`;
};

export const countContentLines = (body = '') => {
  return body.split(/\r?\n/).length;
};

export const getInterviewStats = (body = '') => {
  return {
    questionCount: countInterviewQuestions(body),
    wordCount: countReadableWords(body),
    lineCount: countContentLines(body),
  };
};
