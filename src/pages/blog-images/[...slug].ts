import path from "node:path";
import { readFile } from "node:fs/promises";
import type { APIContext, GetStaticPaths } from "astro";
import {
  BLOG_CONTENT_IMAGES_DIR,
  getImageContentType,
  listBlogContentImages,
  resolveBlogContentImagePath,
} from "@/utils/blogContentImages.js";

export const prerender = true;

export const getStaticPaths = (async () => {
  return listBlogContentImages().map((localPath: string) => ({
    params: {
      slug: path.relative(BLOG_CONTENT_IMAGES_DIR, localPath).split(path.sep).join("/"),
    },
  }));
}) satisfies GetStaticPaths;

export async function GET({ params }: APIContext) {
  const localPath = resolveBlogContentImagePath(params.slug ?? "");

  if (!localPath) {
    return new Response(null, { status: 404 });
  }

  const body = await readFile(localPath);

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": getImageContentType(localPath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
