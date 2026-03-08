import rss from '@astrojs/rss';
import {site} from "../consts";
import getUrl from "../utils/getUrl.js";
import {getCollectionByName} from "@/utils/getCollectionByName";
import {sortPostsByDate} from "@/utils/sortPostsByDate";
import {getPostPlainText, truncateText} from "@/utils/getPostPlainText";

export async function GET() {
  const blogs = await getCollectionByName('blog')
  let sortPosts = sortPostsByDate(blogs);
  let blog = sortPosts.splice(0, 20);

  return rss({
    title: site.title,
    description: site.description,
    site: site.url,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: truncateText(
        post.data.description || getPostPlainText(post.body),
        180
      ),
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `${getUrl("/blog/")}${post.slug}/`,
    })),
  });
}
