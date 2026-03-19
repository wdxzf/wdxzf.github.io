---
name: astro-yi-blog
description: 维护这个 Astro Yi 博客仓库。用于编辑博文、feed 条目、页面、组件、站点配置、图片、导航、评论、分析，或者使用仓库中的 Astro 脚本验证站点。
---

# Astro Yi 博客

在这个仓库里执行任务时使用这个技能。

## 从这里开始

- 先查看 `package.json`，了解可用脚本。
- 在修改全站配置前，先查看 `src/consts.ts`。
- 在编辑文章前，先查看 `src/content/blog` 或 `src/content/feed` 下的目标内容文件。
- 在修改界面前，先查看 `src/pages` 或 `src/components` 下对应的页面或组件。

## 内容工作流

- 在 `src/content/blog/*.md` 中编辑博客文章。
- 在 `src/content/feed/*.md` 中编辑动态 feed 条目。
- 保持 frontmatter 与现有内容 schema 一致。
- 尽量把文章图片放在 `src/content/blog/images/<slug>/` 下。
- 使用与当前文章目录结构匹配的相对图片路径。
- 除非用户要求重写，否则保留 Markdown 结构、标题和代码块。

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

- 在代码或配置修改后运行 `pnpm run typecheck`。
- 在完成较大改动前运行 `pnpm run build`。
- 当用户需要本地预览站点时，使用 `pnpm run dev`。

## 约束

- 除非明确要求，不要编辑 `dist`、`node_modules` 或生成产物。
- 保持改动尽量小，并与现有博客主题一致。
