import { marked } from "../vendor/marked.esm.js";
import createDOMPurify from "../vendor/purify.es.mjs";

const $ = (selector) => document.querySelector(selector);

const settingsFields = [
  "gh-owner",
  "gh-repo",
  "gh-branch",
  "gh-token",
  "posts-path",
  "uploads-path",
  "base-url",
  "api-base",
];

const metaFields = [
  "post-title",
  "post-description",
  "post-date",
  "post-slug",
  "post-category",
  "post-tags",
  "post-draft",
  "post-toc",
  "post-donate",
  "post-comment",
  "post-mermaid",
  "post-mathjax",
  "post-sticky",
];

const statusEl = $("#status");
const markdownInput = $("#markdown-input");
const markdownPreview = $("#markdown-preview");
const editorCard = document.querySelector(".editor-card");
const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
const syncToggle = $("#sync-frontmatter");
const quickDraftToggle = $("#quick-draft");
const drawer = $("#settings-drawer");
const drawerOverlay = $("#drawer-overlay");
const openSettingsBtn = $("#open-settings");
const closeSettingsBtn = $("#close-settings");
const sanitizer = createDOMPurify(window);

if (!markdownInput || !markdownPreview || !statusEl) {
  throw new Error("Publish editor elements not found.");
}

const setDrawerOpen = (open) => {
  if (!drawer) return;
  drawer.dataset.open = open ? "true" : "false";
  document.body.style.overflow = open ? "hidden" : "";
};

const setEditorMode = (mode) => {
  if (!editorCard) return;
  editorCard.dataset.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
};

const today = new Date().toISOString().slice(0, 10);
const dateInput = $("#post-date");
if (dateInput) dateInput.value = today;

const storageKey = "publish-settings-v1";
const draftKey = "publish-draft-v1";

const setStatus = (message, tone = "neutral") => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.opacity = tone === "error" ? "1" : "0.7";
  statusEl.style.color = tone === "error" ? "#ef4444" : "inherit";
};

const loadSettings = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  const saved = JSON.parse(raw);
  settingsFields.forEach((id) => {
    if (saved[id] !== undefined) {
      const field = $("#" + id);
      if (field) field.value = saved[id];
    }
  });
};

const saveSettings = () => {
  const payload = {};
  settingsFields.forEach((id) => {
    const field = $("#" + id);
    if (field) payload[id] = field.value.trim();
  });
  localStorage.setItem(storageKey, JSON.stringify(payload));
};

const loadDraft = () => {
  const raw = localStorage.getItem(draftKey);
  if (!raw) return;
  const saved = JSON.parse(raw);
  metaFields.forEach((id) => {
    if (saved[id] !== undefined) {
      const field = $("#" + id);
      if (!field) return;
      if (field.type === "checkbox") {
        field.checked = saved[id];
      } else {
        field.value = saved[id];
      }
    }
  });
  markdownInput.value = saved.body || "";
  if (quickDraftToggle) {
    const draftField = $("#post-draft");
    if (draftField) quickDraftToggle.checked = draftField.checked;
  }
  if (syncToggle?.checked) {
    const parsed = parseFrontmatter(markdownInput.value);
    if (parsed?.data) {
      applyFieldsFromFrontmatter(parsed.data);
    }
  }
};

const saveDraft = () => {
  const payload = {};
  metaFields.forEach((id) => {
    const field = $("#" + id);
    if (!field) return;
    if (field.type === "checkbox") {
      payload[id] = field.checked;
    } else {
      payload[id] = field.value;
    }
  });
  payload.body = markdownInput.value;
  localStorage.setItem(draftKey, JSON.stringify(payload));
  saveSettings();
  setStatus("草稿已保存。");
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseInlineList = (value) =>
  value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

const parseFrontmatter = (value) => {
  if (!value.startsWith("---")) return null;
  const end = value.indexOf("\n---", 3);
  if (end === -1) return null;
  const raw = value.slice(3, end).trim();
  const data = {};
  raw.split("\n").forEach((line) => {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) return;
    const key = match[1];
    const val = match[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      data[key] = parseInlineList(val);
      return;
    }
    if (val === "true" || val === "false") {
      data[key] = val === "true";
      return;
    }
    const num = Number(val);
    if (!Number.isNaN(num) && val !== "") {
      data[key] = num;
      return;
    }
    data[key] = val.replace(/^["']|["']$/g, "");
  });
  return { data, endIndex: end + 4 };
};

const frontmatterMap = {
  title: "post-title",
  description: "post-description",
  date: "post-date",
  category: "post-category",
  tags: "post-tags",
  draft: "post-draft",
  toc: "post-toc",
  donate: "post-donate",
  comment: "post-comment",
  mermaid: "post-mermaid",
  mathjax: "post-mathjax",
  sticky: "post-sticky",
};

let syncingFromMarkdown = false;

const applyFieldsFromFrontmatter = (data) => {
  Object.entries(frontmatterMap).forEach(([key, fieldId]) => {
    if (!(key in data)) return;
    const field = $("#" + fieldId);
    if (!field) return;
    const value = data[key];
    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }
    if (Array.isArray(value)) {
      field.value = value.join(", ");
      return;
    }
    field.value = String(value);
  });
  if (quickDraftToggle) {
    const draftField = $("#post-draft");
    if (draftField) quickDraftToggle.checked = draftField.checked;
  }
};

const updateMarkdownFrontmatter = () => {
  if (!markdownInput) return;
  const current = markdownInput.value;
  const parsed = parseFrontmatter(current);
  const frontmatter = buildFrontmatter();
  let next = current;

  if (parsed) {
    const after = current.slice(parsed.endIndex);
    next = `${frontmatter}${after.replace(/^\s+/, "")}`;
  } else {
    next = `${frontmatter}${current.replace(/^\s+/, "")}`;
  }

  const wasFocused = document.activeElement === markdownInput;
  const selectionStart = markdownInput.selectionStart;
  const selectionEnd = markdownInput.selectionEnd;
  const scrollTop = markdownInput.scrollTop;
  const scrollLeft = markdownInput.scrollLeft;
  const oldFrontmatterLength = parsed ? parsed.endIndex : 0;
  const newFrontmatterLength = frontmatter.length;

  markdownInput.value = next;
  markdownInput.scrollTop = scrollTop;
  markdownInput.scrollLeft = scrollLeft;

  if (wasFocused) {
    const startInBody = Math.max(selectionStart - oldFrontmatterLength, 0);
    const endInBody = Math.max(selectionEnd - oldFrontmatterLength, 0);
    markdownInput.selectionStart = newFrontmatterLength + startInBody;
    markdownInput.selectionEnd = newFrontmatterLength + endInBody;
  }
  renderPreview();
};

const buildFrontmatter = () => {
  const title = ($("#post-title")?.value || "").trim();
  const description = ($("#post-description")?.value || "").trim();
  const date = ($("#post-date")?.value || "").trim();
  const tags = formatList($("#post-tags")?.value || "");
  const category = formatList($("#post-category")?.value || "");
  const draft = $("#post-draft")?.checked || false;
  const toc = $("#post-toc")?.checked ?? true;
  const donate = $("#post-donate")?.checked ?? true;
  const comment = $("#post-comment")?.checked ?? true;
  const mermaid = $("#post-mermaid")?.checked || false;
  const mathjax = $("#post-mathjax")?.checked || false;
  const sticky = parseInt($("#post-sticky")?.value || "0", 10);

  const lines = [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
  ];

  if (description) {
    lines.push(`description: "${description.replace(/"/g, '\\"')}"`);
  }
  if (date) lines.push(`date: ${date}`);
  if (category.length) lines.push(`category: [${category.map((c) => `"${c}"`).join(", ")}]`);
  if (tags.length) lines.push(`tags: [${tags.map((t) => `"${t}"`).join(", ")}]`);
  if (sticky > 0) lines.push(`sticky: ${sticky}`);
  if (!toc) lines.push("toc: false");
  if (!donate) lines.push("donate: false");
  if (!comment) lines.push("comment: false");
  if (draft) lines.push("draft: true");
  if (mermaid) lines.push("mermaid: true");
  if (mathjax) lines.push("mathjax: true");

  lines.push("---", "");
  return lines.join("\n");
};

const buildMarkdown = () => {
  const frontmatter = buildFrontmatter();
  return frontmatter + markdownInput.value.trim() + "\n";
};

const stripFrontmatter = (value) => {
  if (!value.startsWith("---")) return value;
  const end = value.indexOf("\n---", 3);
  if (end === -1) return value;
  return value.slice(end + 4).replace(/^\s+/, "");
};

const stripLeadingTitle = (value) => {
  const lines = value.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("# ")) {
      lines.splice(i, 1);
      if (lines[i] === "") lines.splice(i, 1);
      break;
    }
    if (lines[i].trim() !== "") break;
  }
  return lines.join("\n");
};

const renderCollapses = (value) => {
  const lines = value.split("\n");
  const output = [];
  let inCollapse = false;
  let summary = "";
  let buffer = [];

  const flush = () => {
    const summaryText = summary || "折叠内容";
    output.push(`<details class="md-collapse">`);
    output.push(`<summary>${summaryText}</summary>`);
    output.push("", ...buffer, "", "</details>");
    summary = "";
    buffer = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith(":::collapse")) {
      inCollapse = true;
      summary = "";
      buffer = [];
      continue;
    }
    if (inCollapse && line.trim() === ":::") {
      inCollapse = false;
      flush();
      continue;
    }
    if (inCollapse && !summary && line.trim() !== "") {
      summary = line.replace(/^#{1,6}\s+/, "").trim();
      continue;
    }
    if (inCollapse) {
      buffer.push(line);
    } else {
      output.push(line);
    }
  }
  if (inCollapse) flush();
  return output.join("\n");
};

const preparePreview = (value) => {
  const withoutFrontmatter = stripFrontmatter(value);
  const withoutTitle = stripLeadingTitle(withoutFrontmatter);
  return renderCollapses(withoutTitle);
};

const renderPreview = () => {
  try {
    const raw = preparePreview(markdownInput.value);
    const html = marked.parse(raw, { breaks: true, gfm: true });
    markdownPreview.innerHTML = sanitizer.sanitize(html);
  } catch (error) {
    markdownPreview.textContent = markdownInput.value;
    setStatus("预览渲染失败，已显示纯文本。", "error");
  }
};

const apiRequest = async (path, options = {}) => {
  const token = ($("#gh-token")?.value || "").trim();
  const apiBase = ($("#api-base")?.value || "").trim().replace(/\/$/, "");
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
};

const encodePath = (value) => encodeURIComponent(value).replace(/%2F/g, "/");

const ensureSlug = () => {
  const slugField = $("#post-slug");
  if (!slugField) return "";
  if (!slugField.value.trim()) {
    slugField.value = slugify($("#post-title")?.value || "");
  }
  return slugField.value.trim();
};

const uploadImage = async (file) => {
  const owner = ($("#gh-owner")?.value || "").trim();
  const repo = ($("#gh-repo")?.value || "").trim();
  const branch = ($("#gh-branch")?.value || "").trim();
  const uploadsPath = ($("#uploads-path")?.value || "").trim().replace(/\/$/, "");
  if (!owner || !repo || !($("#gh-token")?.value || "").trim()) {
    throw new Error("请先填写 GitHub 配置再上传。");
  }
  const timestamp = new Date();
  const folder = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, "0")}`;
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `${uploadsPath}/${folder}/${safeName}`;

  const reader = new FileReader();
  const base64 = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  await apiRequest(`/repos/${owner}/${repo}/contents/${encodePath(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Upload image ${safeName}`,
      content: base64,
      branch,
    }),
  });

  const baseUrl = ($("#base-url")?.value || "").trim().replace(/\/$/, "");
  const publicPath = path.replace(/^public\//, "");
  return `${baseUrl}${baseUrl ? "/" : "/"}${publicPath}`;
};

const publishPost = async () => {
  const owner = ($("#gh-owner")?.value || "").trim();
  const repo = ($("#gh-repo")?.value || "").trim();
  const branch = ($("#gh-branch")?.value || "").trim();
  const postsPath = ($("#posts-path")?.value || "").trim().replace(/\/$/, "");
  const slug = ensureSlug();
  const filePath = `${postsPath}/${slug}.md`;

  if (!owner || !repo) {
    setStatus("请填写 GitHub 仓库信息。", "error");
    return;
  }

  if (!($("#gh-token")?.value || "").trim()) {
    setStatus("请填写 GitHub Token。", "error");
    return;
  }

  if (!($("#post-title")?.value || "").trim()) {
    setStatus("标题不能为空。", "error");
    return;
  }
  if (!slug) {
    setStatus("Slug 不能为空。", "error");
    return;
  }

  const markdown = buildMarkdown();
  const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(markdown)));

  setStatus("发布中...");

  let sha = null;
  try {
    const existing = await apiRequest(
      `/repos/${owner}/${repo}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(branch)}`
    );
    sha = existing.sha;
  } catch {
    sha = null;
  }

  const payload = {
    message: `Publish ${slug}`,
    content: encoded,
    branch,
  };
  if (sha) payload.sha = sha;

  await apiRequest(`/repos/${owner}/${repo}/contents/${encodePath(filePath)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  saveSettings();
  setStatus("发布成功。");
};

$("#post-title")?.addEventListener("input", ensureSlug);
markdownInput.addEventListener("input", () => {
  renderPreview();
  if (syncToggle?.checked) {
    const parsed = parseFrontmatter(markdownInput.value);
    if (parsed?.data) {
      syncingFromMarkdown = true;
      applyFieldsFromFrontmatter(parsed.data);
      syncingFromMarkdown = false;
    }
  }
});
markdownInput.addEventListener("paste", async (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
  if (!imageItem) return;
  event.preventDefault();
  const file = imageItem.getAsFile();
  if (!file) return;
  setStatus("正在上传图片...");
  try {
    const url = await uploadImage(file);
    const insert = `![${file.name || "pasted-image"}](${url})\n`;
    const start = markdownInput.selectionStart;
    const end = markdownInput.selectionEnd;
    const before = markdownInput.value.slice(0, start);
    const after = markdownInput.value.slice(end);
    markdownInput.value = `${before}${insert}${after}`;
    markdownInput.selectionStart = markdownInput.selectionEnd = start + insert.length;
    markdownInput.focus();
    renderPreview();
    setStatus("图片上传成功。");
  } catch (error) {
    setStatus(error.message || "图片上传失败。", "error");
  }
});
$("#save-draft")?.addEventListener("click", saveDraft);
$("#publish")?.addEventListener("click", async () => {
  try {
    await publishPost();
  } catch (error) {
    setStatus(error.message || "发布失败。", "error");
  }
});

$("#copy-markdown")?.addEventListener("click", () => {
  const markdown = buildMarkdown();
  navigator.clipboard.writeText(markdown);
  setStatus("Markdown 已复制。");
});

Object.values(frontmatterMap).forEach((fieldId) => {
  const field = $("#" + fieldId);
  if (!field) return;
  field.addEventListener("input", () => {
    if (!syncToggle?.checked || syncingFromMarkdown) return;
    updateMarkdownFrontmatter();
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode || "split";
    setEditorMode(mode);
  });
});

const draftField = $("#post-draft");
if (draftField && quickDraftToggle) {
  quickDraftToggle.checked = draftField.checked;
  quickDraftToggle.addEventListener("change", () => {
    draftField.checked = quickDraftToggle.checked;
    if (syncToggle?.checked) updateMarkdownFrontmatter();
  });
  draftField.addEventListener("change", () => {
    quickDraftToggle.checked = draftField.checked;
  });
}

openSettingsBtn?.addEventListener("click", () => {
  setDrawerOpen(true);
});

closeSettingsBtn?.addEventListener("click", () => {
  setDrawerOpen(false);
});

drawerOverlay?.addEventListener("click", () => {
  setDrawerOpen(false);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawer?.dataset.open === "true") {
    setDrawerOpen(false);
  }
});

$("#insert-image")?.addEventListener("click", async () => {
  const file = $("#image-upload")?.files?.[0];
  if (!file) {
    setStatus("请先选择图片。", "error");
    return;
  }
  setStatus("正在上传图片...");
  try {
    const url = await uploadImage(file);
    const insert = `![${file.name}](${url})\n`;
    const start = markdownInput.selectionStart;
    const end = markdownInput.selectionEnd;
    const before = markdownInput.value.slice(0, start);
    const after = markdownInput.value.slice(end);
    markdownInput.value = `${before}${insert}${after}`;
    markdownInput.selectionStart = markdownInput.selectionEnd = start + insert.length;
    markdownInput.focus();
    renderPreview();
    setStatus("图片上传成功。");
  } catch (error) {
    setStatus(error.message || "图片上传失败。", "error");
  }
});

$("#import-md")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  markdownInput.value = text;
  renderPreview();
  setStatus("已导入 Markdown。");
});

loadSettings();
loadDraft();
renderPreview();
setEditorMode(editorCard?.dataset.mode || "split");

syncToggle?.addEventListener("change", () => {
  if (syncToggle.checked) {
    const parsed = parseFrontmatter(markdownInput.value);
    if (parsed?.data) {
      applyFieldsFromFrontmatter(parsed.data);
    } else {
      updateMarkdownFrontmatter();
    }
  }
});
