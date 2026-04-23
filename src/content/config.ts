import {defineCollection, z} from 'astro:content';

const placeholderDescriptionValues = new Set([
  '一句话描述这篇文章讲什么',
]);

const placeholderTaxonomyValues = new Set([
  '分类1',
  '分类2',
  '标签1',
  '标签2',
]);

function normalizeTaxonomyValue(value: string) {
  return value.trim();
}

function toValueList(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.map(normalizeTaxonomyValue);
  }

  if (typeof value === 'string') {
    return [normalizeTaxonomyValue(value)];
  }

  return [];
}

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    date: z.date(),
    lastModified: z.date().or(z.string()).optional().nullable(),
    series: z.string().optional().nullable(),
    seriesOrder: z.number().optional().nullable(),
    tags: z.array(z.string()).or(z.string()).optional().nullable(),
    category: z.array(z.string()).or(z.string()).default('uncategorized').nullable(),
    sticky: z.number().default(0).nullable(),
    mathjax: z.boolean().default(false).nullable(),
    mermaid: z.boolean().default(false).nullable(),
    draft: z.boolean().default(false).nullable(),
    toc: z.boolean().default(true).nullable(),
    donate: z.boolean().default(true).nullable(),
    comment: z.boolean().default(true).nullable(),
    ogImage: z.string().optional()
  }).superRefine((data, ctx) => {
    if (data.draft) {
      return;
    }

    const description = data.description?.trim() ?? '';
    if (!description || placeholderDescriptionValues.has(description)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Published posts must provide a real description.',
        path: ['description'],
      });
    }

    const categories = toValueList(data.category);
    if (categories.some((value) => placeholderTaxonomyValues.has(value))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Published posts cannot use placeholder categories.',
        path: ['category'],
      });
    }

    const tags = toValueList(data.tags);
    if (tags.some((value) => placeholderTaxonomyValues.has(value))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Published posts cannot use placeholder tags.',
        path: ['tags'],
      });
    }
  }),
});

const feed = defineCollection({
  schema: z.object({
    title: z.string().optional().nullable(),
    date: z.date().or(z.string()).optional().nullable(),
    donate: z.boolean().default(true),
    comment: z.boolean().default(true),
  })
});

const interview = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    draft: z.boolean().default(false),
    order: z.number().optional().nullable(),
    section: z.string().optional().nullable(),
  }),
});

export const collections = {blog, feed, interview};
