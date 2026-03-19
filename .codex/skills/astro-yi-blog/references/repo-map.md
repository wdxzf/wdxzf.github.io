# 仓库地图

## 主要区域

- `src/content/blog`: 长篇文章
- `src/content/feed`: 短动态更新
- `src/pages`: Astro 路由
- `src/components`: 共享 UI 组件
- `src/layouts`: 页面外壳
- `src/consts.ts`: 全站设置
- `src/i18n`: 本地化字符串
- `src/plugins`: remark 和 markdown 处理

## 常用命令

- `pnpm run dev`: 启动本地预览
- `pnpm run build`: 生产构建
- `pnpm run typecheck`: Astro 和 TypeScript 检查
- `pnpm run lint`: `typecheck` 的别名

## 编辑说明

- 优先就地编辑内容，不要随意移动文件。
- 保持图片路径与 `src/content/blog/images` 对齐。
- 在修改导航、评论或分析之前，先检查 `src/consts.ts`。
