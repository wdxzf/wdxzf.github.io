import {getCollectionByName} from "../utils/getCollectionByName.js";
import {getPostPlainText, truncateText} from "../utils/getPostPlainText.js";

async function getBlogs() {
  const blog = await getCollectionByName('blog')
  return blog.map(blog => {
    const content = getPostPlainText(blog.body);
    const description = blog.data.description ?? '';

    return {
      slug: blog.slug,
      title: blog.data.title,
      description,
      date: blog.data.date,
      category: blog.data.category,
      tags: blog.data.tags,
      content,
      excerpt: truncateText(description || content, 220),
    }
  })
}

export async function GET({}) {
  return new Response(JSON.stringify(await getBlogs()), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
