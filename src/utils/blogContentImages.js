import path from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";

export const BLOG_CONTENT_IMAGES_DIR = path.join(
  process.cwd(),
  "src",
  "content",
  "blog",
  "images"
);

export const BLOG_CONTENT_IMAGES_ROUTE = "/blog-images";

export function isPathInsideDirectory(targetPath, directoryPath) {
  const relativePath = path.relative(directoryPath, targetPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

export function getBlogContentImageUrl(localPath) {
  if (!localPath || !isPathInsideDirectory(localPath, BLOG_CONTENT_IMAGES_DIR)) {
    return null;
  }

  const relativePath = path.relative(BLOG_CONTENT_IMAGES_DIR, localPath);
  const encodedPath = relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${BLOG_CONTENT_IMAGES_ROUTE}/${encodedPath}`;
}

export function listBlogContentImages(directoryPath = BLOG_CONTENT_IMAGES_DIR) {
  if (!existsSync(directoryPath)) {
    return [];
  }

  const entries = readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listBlogContentImages(fullPath));
      continue;
    }

    if (entry.isFile() || statSync(fullPath).isFile()) {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right, "zh-CN"));
}

export function resolveBlogContentImagePath(relativePath) {
  if (!relativePath) {
    return null;
  }

  const decodedPath = decodeURIComponent(relativePath);
  const localPath = path.resolve(BLOG_CONTENT_IMAGES_DIR, decodedPath);

  if (!isPathInsideDirectory(localPath, BLOG_CONTENT_IMAGES_DIR) || !existsSync(localPath)) {
    return null;
  }

  return localPath;
}

export function getImageContentType(localPath) {
  const extension = path.extname(localPath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}
