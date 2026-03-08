import {visit} from "unist-util-visit";
import path from "path";
import {existsSync, readFileSync} from "fs";
import sharp from "sharp";
import getUrl from "../utils/getUrl.js";

export function lazyLoadImage() {
  return async function (tree, file) {
    const pendingTasks = [];

    visit(tree, function (node) {
      if (node.tagName !== 'img') {
        return;
      }

      pendingTasks.push(decorateImageNode(node, file));
    });

    await Promise.all(pendingTasks);
  };
}

async function decorateImageNode(node, file) {
  const properties = node.properties ?? {};
  const source = properties.src;
  const resolvedSource = resolveSourceValue(source);

  if (!resolvedSource) {
    return;
  }

  properties.loading = 'lazy';
  properties.decoding = 'async';
  properties['data-src'] = resolvedSource;

  const altText = typeof properties.alt === 'string' ? properties.alt : '';
  if (altText) {
    properties['data-alt'] = altText;
  }

  if (!properties.width || !properties.height) {
    const dimensions =
      resolveObjectDimensions(source) ||
      (await resolveImageDimensions(resolvedSource, file));

    if (dimensions?.width && dimensions?.height) {
      properties.width = dimensions.width;
      properties.height = dimensions.height;
    }
  }

  properties.src = getUrl('/spinner.gif');
}

function resolveSourceValue(source) {
  const rawSource =
    typeof source === 'string'
      ? source
      : source && typeof source === 'object' && typeof source.src === 'string'
        ? source.src
        : '';

  if (!rawSource) {
    return '';
  }

  if (rawSource.startsWith('public/')) {
    return getUrl(`/${rawSource.replace(/^public\/+/, '')}`);
  }

  return rawSource;
}

function resolveObjectDimensions(source) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const width =
    typeof source.width === 'number' ? source.width : Number(source.width);
  const height =
    typeof source.height === 'number' ? source.height : Number(source.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return { width, height };
}

async function resolveImageDimensions(src, file) {
  const localPath = resolveLocalImagePath(src, file);
  if (!localPath) {
    return null;
  }

  try {
    const metadata = await sharp(localPath).metadata();
    if (!metadata.width || !metadata.height) {
      return resolveSvgDimensions(localPath);
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch {
    return resolveSvgDimensions(localPath);
  }
}

function resolveLocalImagePath(src, file) {
  if (!file?.history?.[0]) {
    return null;
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return null;
  }

  const decodedSrc = decodeURIComponent(src);
  const fileDirectory = path.dirname(file.history[0]);
  const candidates = [];

  if (decodedSrc.startsWith('/')) {
    candidates.push(path.join(process.cwd(), 'public', decodedSrc.replace(/^\/+/, '')));
  } else if (decodedSrc.startsWith('public/')) {
    candidates.push(path.join(process.cwd(), decodedSrc));
    candidates.push(path.join(process.cwd(), 'public', decodedSrc.replace(/^public\/+/, '')));
  } else {
    candidates.push(path.resolve(fileDirectory, decodedSrc));
    candidates.push(path.join(process.cwd(), 'public', decodedSrc.replace(/^\/+/, '')));
  }

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function resolveSvgDimensions(localPath) {
  if (path.extname(localPath).toLowerCase() !== '.svg' || !existsSync(localPath)) {
    return null;
  }

  try {
    const source = readFileSync(localPath, 'utf8');
    const widthMatch = source.match(/\bwidth=["']([\d.]+)(px)?["']/i);
    const heightMatch = source.match(/\bheight=["']([\d.]+)(px)?["']/i);

    if (widthMatch && heightMatch) {
      return {
        width: Number(widthMatch[1]),
        height: Number(heightMatch[1]),
      };
    }

    const viewBoxMatch = source.match(/\bviewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
    if (viewBoxMatch) {
      return {
        width: Number(viewBoxMatch[1]),
        height: Number(viewBoxMatch[2]),
      };
    }
  } catch {
    return null;
  }

  return null;
}
