# Astro Yi 博客

本文件用于说明这个仓库的协作约定，供 AI 助手优先参考。

## 从这里开始

- 需要了解可用脚本时，查看 `package.json`。
- 需要修改全站配置时，先读 `src/consts.ts`，再动手。
- 需要编辑文章或 feed 时，先读 `src/content/blog` 或 `src/content/feed` 下的目标内容文件。
- 需要修改页面或组件时，先读 `src/pages`、`src/components` 或 `src/layouts` 中对应文件。

## 内容工作流

- 在 `src/content/blog/*.md` 中编辑博客文章。
- `src/content/blog` 支持子目录分类；子目录中的 `.md` 文件同样会被识别为博客文章。
- 目录本身不会生成页面，只有 `.md` 文件会被收集。
- 推荐按技术方向或主题划分子目录，例如 `src/content/blog/wsl/xxx.md`、`src/content/blog/stm32/yyy.md`。
- 在 `src/content/feed/*.md` 中编辑动态 feed 条目。
- 默认不要修改草稿文章；只有用户明确要求时，才编辑 `draft: true` 的内容。
- 保持 frontmatter 与现有内容 schema 一致，不要凭空添加未定义字段。
- 生成博客内容时，注意本项目有 `astro-yi` 特有的 Markdown 指令语法，不能默认退回普通 HTML 或忽略不写。
- 明确遵循这些自定义语法：`:spoiler[]`、`:btn[]`、`:::tip`、`:::note`、`:::caution`、`:::danger`、`:::collapse`、`::github{repo}`。
- 如果任务需要使用这些块或内联效果，而用户没有再次提供语法示例，也要按这里的规则正确写入。
- 尽量把文章图片放在 `src/content/blog/images/<slug>/` 下。
- 使用与当前文章目录结构匹配的相对图片路径。
- 优先保留 `images/<文章目录>/<文件名>` 这类相对路径；不要擅自改成绝对路径，也不要把文章图片复制到 `public/`，除非用户明确要求。
- 除非用户要求重写，否则保留 Markdown 结构、标题和代码块。
- Markdown、`AGENTS.md` 和其他文本内容统一使用 UTF-8 编码保存，避免乱码或混合编码。

## Frontmatter 规范

- 博客文章 frontmatter 示例：

```md
---
title: ""
description: ""
date: 2026-04-14
lastModified: 2026-04-14
series: ""
seriesOrder: 1
category: []
tags: []
sticky: 0
mathjax: false
mermaid: false
draft: false
toc: true
donate: true
comment: true
slug: ""
ogImage: ""
---
```

- `blog` 集合必填核心字段：`title`、`date`。
- 已发布文章通常应提供：`description`、`category`、`tags`；不要使用占位值如 `一句话描述这篇文章讲什么`、`分类1`、`标签1`。
- `category` 与 `tags` 既可写数组，也可写单个字符串；默认优先使用数组。
- `lastModified` 可写日期；`series`、`seriesOrder`、`ogImage` 为可选字段。
- `slug` 虽然不在内容 schema 中强制要求，但本仓库文章常使用它来固定链接，新增文章时可按需填写。

- feed 条目 frontmatter 示例：

```md
---
title: ""
date: 2026-04-14 21:00:00
donate: true
comment: true
---
```

- `feed` 集合和 `blog` 不同，不要套用博客文章的完整 frontmatter。
- `feed` 常用字段只有 `title`、`date`、`donate`、`comment`。

## 扩展 Markdown 语法

- 本博客支持以下自定义指令，生成内容时可按需使用。
- `:spoiler[文字]`：遮掩文本。
- `:btn[文字]{href="url"}`：按钮链接。
- `::github{repo="user/repo"}`：GitHub 仓库卡片。
- `:::tip[标题] ... :::`：提示块。
- `:::note[标题] ... :::`：说明块。
- `:::caution[标题] ... :::`：注意块。
- `:::danger[标题] ... :::`：危险提示块。
- `:::collapse[标题] ... :::`：折叠块。

## 站点配置工作流

- 在 `src/consts.ts` 中修改全站数据。
- 在那里更新标题、作者、头像、导航、社交链接、评论、分析和分页。
- 优先在 `src/consts.ts` 里做小而精确的修改，不要把配置分散到新文件中。
- 如果修改涉及内容集合或 schema 规则，请检查 `src/content/config.ts`。

## 界面工作流

- 在 `src/pages` 中修改页面路由。
- 在 `src/components` 和 `src/layouts` 中修改共享展示逻辑。
- 保持仓库现有的 Astro 和 Tailwind 风格。
- 当改动影响可见文案或本地化输出时，检查 `src/i18n` 下的文件。

## 校验

- 新增或修改文章后，运行 `pnpm run validate:content`，确认 frontmatter、slug、图片路径、日期格式和 mermaid 标记无报错。
- 修改 `.ts`、`.js`、`.astro`、内容 schema 或插件逻辑后：运行 `pnpm run typecheck`。
- 修改路由、配置、构建相关文件后：运行 `pnpm run build`。
- 仅修改普通 `.md` 文章或 feed 内容，且未改 schema、组件、路由、配置时：只需运行 `pnpm run validate:content`，可跳过 `typecheck` 和 `build`。
- 每次准备提交前运行 `git status`，确认改动范围可提交。
- 只有在校验通过，或已经明确定位并告知用户失败原因不影响当前目标时，才执行提交。
- 当用户需要本地预览站点时，使用 `pnpm run dev`。

## 提交规范

- Git 提交信息使用 `type: 简短描述` 格式。
- 提交描述使用中文，保持简短清晰，并以动词开头。
- 一次提交只做一件事，避免把不相关改动混在同一个提交里。
- 新增或更新博客文章、feed 条目时使用 `content`。
- 常用类型包括 `feat`、`fix`、`refactor`、`docs`、`content`。
- 示例：`feat: 新增底盘控制`、`fix: 修复校验错误`、`refactor: 优化协议解析`、`docs: 更新说明文档`、`content: 新增 WSL2 配置记录`。

## 约束

- 不要自行安装新依赖，除非用户明确要求。
- 除非明确要求，不要编辑 `dist`、`node_modules` 或生成产物。
- 保持改动尽量小，并与现有博客主题一致。
