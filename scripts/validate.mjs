import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const FEED_DIR = path.join(ROOT, 'src/content/feed');
const PLACEHOLDER_DESCRIPTION_VALUES = new Set([
  '一句话描述这篇文章讲什么',
]);
const PLACEHOLDER_TAXONOMY_VALUES = new Set([
  '分类1',
  '分类2',
  '标签1',
  '标签2',
]);

const errors = [];
const warnings = [];
const slugOwners = new Map();

main();

function main() {
  for (const filePath of walkMarkdownFiles(BLOG_DIR)) {
    validateMarkdownFile(filePath, 'blog');
  }

  for (const filePath of walkMarkdownFiles(FEED_DIR)) {
    validateMarkdownFile(filePath, 'feed');
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.error('Validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Content validation passed.');
}

function walkMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function validateMarkdownFile(filePath, collection) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const frontmatter = extractFrontmatter(raw, filePath);
  if (!frontmatter) {
    return;
  }

  const parsed = parseFrontmatter(frontmatter.text, filePath, frontmatter.startLine);
  const data = parsed.data;

  if (collection === 'blog') {
    validateBlogFrontmatter(filePath, data, parsed.keyLines);
  } else {
    validateFeedFrontmatter(filePath, data, parsed.keyLines);
  }

  validateMarkdownBody(filePath, frontmatter.body, frontmatter.bodyStartLine, data, collection);
}

function extractFrontmatter(raw, filePath) {
  const normalized = (raw.startsWith('\uFEFF') ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    errors.push(formatMessage(filePath, 1, '缺少 frontmatter 起始分隔符 ---'));
    return null;
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    errors.push(formatMessage(filePath, 1, '缺少 frontmatter 结束分隔符 ---'));
    return null;
  }

  return {
    text: normalized.slice(4, endIndex),
    body: normalized.slice(endIndex + 5),
    startLine: 2,
    bodyStartLine: normalized.slice(0, endIndex + 5).split('\n').length,
  };
}

function parseFrontmatter(text, filePath, startLine) {
  const data = {};
  const keyLines = new Map();
  const lines = text.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNo = startLine + index;
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!match) {
      errors.push(formatMessage(filePath, lineNo, `无法解析 frontmatter 行：${trimmed}`));
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = parseScalarValue(rawValue.trim());
    keyLines.set(key, lineNo);
  }

  return {data, keyLines};
}

function parseScalarValue(rawValue) {
  if (!rawValue) {
    return '';
  }

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    return splitInlineArray(rawValue.slice(1, -1));
  }

  if (/^(true|false)$/i.test(rawValue)) {
    return rawValue.toLowerCase() === 'true';
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  if (/^(null|~)$/i.test(rawValue)) {
    return null;
  }

  return rawValue;
}

function splitInlineArray(content) {
  if (!content.trim()) {
    return [];
  }

  const parts = [];
  let current = '';
  let quote = '';

  for (const char of content) {
    if (quote) {
      if (char === quote) {
        quote = '';
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ',') {
      parts.push(normalizeArrayValue(current));
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(normalizeArrayValue(current));
  return parts;
}

function normalizeArrayValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function validateBlogFrontmatter(filePath, data, keyLines) {
  const allowedKeys = new Set([
    'title',
    'description',
    'date',
    'lastModified',
    'series',
    'seriesOrder',
    'tags',
    'category',
    'sticky',
    'mathjax',
    'mermaid',
    'draft',
    'toc',
    'donate',
    'comment',
    'ogImage',
    'slug',
  ]);

  validateUnknownKeys(filePath, data, keyLines, allowedKeys);

  requireString(filePath, data, keyLines, 'title');
  requireDateString(filePath, data, keyLines, 'date');
  optionalString(filePath, data, keyLines, 'description');
  optionalDateString(filePath, data, keyLines, 'lastModified');
  optionalString(filePath, data, keyLines, 'series');
  optionalNumber(filePath, data, keyLines, 'seriesOrder');
  optionalStringOrArray(filePath, data, keyLines, 'tags');
  optionalStringOrArray(filePath, data, keyLines, 'category');
  optionalNumber(filePath, data, keyLines, 'sticky');
  optionalBoolean(filePath, data, keyLines, 'mathjax');
  optionalBoolean(filePath, data, keyLines, 'mermaid');
  optionalBoolean(filePath, data, keyLines, 'draft');
  optionalBoolean(filePath, data, keyLines, 'toc');
  optionalBoolean(filePath, data, keyLines, 'donate');
  optionalBoolean(filePath, data, keyLines, 'comment');
  optionalString(filePath, data, keyLines, 'slug');
  optionalString(filePath, data, keyLines, 'ogImage');

  const draft = data.draft === true;
  if (!draft) {
    const description = typeof data.description === 'string' ? data.description.trim() : '';
    if (!description) {
      errors.push(formatMessage(filePath, keyLines.get('description') ?? 1, '已发布文章必须提供 description'));
    } else if (PLACEHOLDER_DESCRIPTION_VALUES.has(description)) {
      errors.push(formatMessage(filePath, keyLines.get('description') ?? 1, 'description 不能使用占位文本'));
    }

    validateTaxonomyValues(filePath, keyLines.get('category') ?? 1, 'category', data.category);
    validateTaxonomyValues(filePath, keyLines.get('tags') ?? 1, 'tags', data.tags);
  }

  if (typeof data.category === 'undefined') {
    warnings.push(formatMessage(filePath, 1, '未填写 category，将退回 schema 默认值 uncategorized'));
  }

  if (typeof data.tags === 'undefined') {
    warnings.push(formatMessage(filePath, 1, '未填写 tags，后续检索与聚合会受影响'));
  }

  const effectiveSlug = resolveEffectiveSlug(filePath, data.slug);
  const existingOwner = slugOwners.get(effectiveSlug);
  if (existingOwner) {
    errors.push(
      `${formatMessage(filePath, keyLines.get('slug') ?? 1, `slug 冲突：${effectiveSlug}`)}；已被 ${path.relative(ROOT, existingOwner)} 使用`
    );
  } else {
    slugOwners.set(effectiveSlug, filePath);
  }

  if (typeof data.ogImage === 'string' && data.ogImage.trim()) {
    validateAssetPath(filePath, keyLines.get('ogImage') ?? 1, data.ogImage, 'ogImage');
  }
}

function validateFeedFrontmatter(filePath, data, keyLines) {
  const allowedKeys = new Set([
    'title',
    'date',
    'donate',
    'comment',
  ]);

  validateUnknownKeys(filePath, data, keyLines, allowedKeys);
  optionalString(filePath, data, keyLines, 'title');
  optionalDateString(filePath, data, keyLines, 'date');
  optionalBoolean(filePath, data, keyLines, 'donate');
  optionalBoolean(filePath, data, keyLines, 'comment');
}

function validateUnknownKeys(filePath, data, keyLines, allowedKeys) {
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) {
      errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `未定义的 frontmatter 字段：${key}`));
    }
  }
}

function requireString(filePath, data, keyLines, key) {
  if (!(key in data)) {
    errors.push(formatMessage(filePath, 1, `缺少必填字段：${key}`));
    return;
  }

  optionalString(filePath, data, keyLines, key, true);
}

function optionalString(filePath, data, keyLines, key, rejectEmpty = false) {
  if (!(key in data) || data[key] == null) {
    return;
  }

  if (typeof data[key] !== 'string') {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 必须是字符串`));
    return;
  }

  if (rejectEmpty && !data[key].trim()) {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 不能为空`));
  }
}

function requireDateString(filePath, data, keyLines, key) {
  if (!(key in data)) {
    errors.push(formatMessage(filePath, 1, `缺少必填字段：${key}`));
    return;
  }

  optionalDateString(filePath, data, keyLines, key, true);
}

function optionalDateString(filePath, data, keyLines, key, rejectEmpty = false) {
  if (!(key in data) || data[key] == null) {
    return;
  }

  if (typeof data[key] !== 'string') {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 必须是日期字符串`));
    return;
  }

  if (rejectEmpty && !data[key].trim()) {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 不能为空`));
    return;
  }

  if (data[key] && !isValidDateString(data[key])) {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 日期格式不合法：${data[key]}`));
  }
}

function optionalNumber(filePath, data, keyLines, key) {
  if (!(key in data) || data[key] == null) {
    return;
  }

  if (typeof data[key] !== 'number' || Number.isNaN(data[key])) {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 必须是数字`));
  }
}

function optionalBoolean(filePath, data, keyLines, key) {
  if (!(key in data) || data[key] == null) {
    return;
  }

  if (typeof data[key] !== 'boolean') {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 必须是布尔值`));
  }
}

function optionalStringOrArray(filePath, data, keyLines, key) {
  if (!(key in data) || data[key] == null) {
    return;
  }

  if (typeof data[key] === 'string') {
    return;
  }

  if (!Array.isArray(data[key]) || data[key].some((item) => typeof item !== 'string')) {
    errors.push(formatMessage(filePath, keyLines.get(key) ?? 1, `${key} 必须是字符串或字符串数组`));
  }
}

function validateTaxonomyValues(filePath, lineNo, key, value) {
  if (typeof value === 'undefined' || value == null) {
    warnings.push(formatMessage(filePath, lineNo, `未填写 ${key}`));
    return;
  }

  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    if (typeof item !== 'string') {
      continue;
    }

    if (PLACEHOLDER_TAXONOMY_VALUES.has(item.trim())) {
      errors.push(formatMessage(filePath, lineNo, `${key} 不能使用占位值：${item}`));
    }
  }
}

function resolveEffectiveSlug(filePath, slugValue) {
  if (typeof slugValue === 'string' && slugValue.trim()) {
    return slugValue.trim();
  }

  return path.basename(filePath, path.extname(filePath));
}

function validateMarkdownBody(filePath, body, bodyStartLine, data, collection) {
  const scanResult = scanMarkdownBody(body, bodyStartLine);

  for (const imageRef of scanResult.imageRefs) {
    validateAssetPath(filePath, imageRef.lineNo, imageRef.target, '图片');
  }

  if (collection === 'blog') {
    const hasMermaidFlag = data.mermaid === true;
    const hasMermaidFence = scanResult.hasMermaidFence;

    if (hasMermaidFlag && !hasMermaidFence) {
      errors.push(formatMessage(filePath, scanResult.firstContentLine ?? bodyStartLine, 'frontmatter 中 mermaid: true，但正文未检测到 ```mermaid 代码块'));
    }

    if (!hasMermaidFlag && hasMermaidFence) {
      errors.push(formatMessage(filePath, scanResult.firstMermaidLine ?? bodyStartLine, '正文包含 ```mermaid 代码块，但 frontmatter 未启用 mermaid: true'));
    }
  }
}

function scanMarkdownBody(body, bodyStartLine) {
  const imageRefs = [];
  const lines = body.split('\n');
  let fence = null;
  let hasMermaidFence = false;
  let firstMermaidLine = null;
  let firstContentLine = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNo = bodyStartLine + index;

    if (!firstContentLine && line.trim()) {
      firstContentLine = lineNo;
    }

    if (fence) {
      if (isFenceClose(line, fence)) {
        fence = null;
      }
      continue;
    }

    const openedFence = parseFenceOpen(line);
    if (openedFence) {
      fence = openedFence;
      if (openedFence.info === 'mermaid') {
        hasMermaidFence = true;
        firstMermaidLine ??= lineNo;
      }
      continue;
    }

    const matches = line.matchAll(/!\[[^\]]*]\(([^)]+)\)/g);
    for (const match of matches) {
      imageRefs.push({
        lineNo,
        target: normalizeMarkdownTarget(match[1]),
      });
    }
  }

  return {imageRefs, hasMermaidFence, firstMermaidLine, firstContentLine};
}

function parseFenceOpen(line) {
  const match = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
  if (!match) {
    return null;
  }

  const marker = match[2];
  const info = match[3].trim().split(/\s+/)[0] ?? '';

  return {
    char: marker[0],
    length: marker.length,
    info,
  };
}

function isFenceClose(line, fence) {
  const pattern = new RegExp(`^\\s*${escapeForRegExp(fence.char)}{${fence.length},}\\s*$`);
  return pattern.test(line);
}

function normalizeMarkdownTarget(target) {
  const trimmed = target.trim();

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1).trim();
  }

  const titleMatch = trimmed.match(/^(\S+)(?:\s+["'][^"']*["'])?$/);
  return titleMatch ? titleMatch[1] : trimmed;
}

function validateAssetPath(filePath, lineNo, target, label) {
  if (!target || isExternalTarget(target)) {
    return;
  }

  const cleanTarget = stripQueryAndHash(target);
  const resolvedPath = cleanTarget.startsWith('/')
    ? path.join(ROOT, 'public', cleanTarget.slice(1))
    : path.resolve(path.dirname(filePath), cleanTarget);

  if (!fs.existsSync(resolvedPath)) {
    errors.push(formatMessage(filePath, lineNo, `${label}路径不存在：${target}`));
  }
}

function isExternalTarget(target) {
  return /^(?:[a-z]+:)?\/\//i.test(target) || /^(?:data|mailto|tel):/i.test(target);
}

function stripQueryAndHash(target) {
  return target.split('#')[0].split('?')[0];
}

function isValidDateString(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    return false;
  }

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const date = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ));

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    date.getUTCHours() === Number(hour) &&
    date.getUTCMinutes() === Number(minute) &&
    date.getUTCSeconds() === Number(second)
  );
}

function formatMessage(filePath, lineNo, message) {
  return `${path.relative(ROOT, filePath)}:${lineNo} ${message}`;
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
