# liuhaojie 的个人博客

一个使用 Astro 与 Markdown 维护的中文个人博客，包含文章、随笔和作品集。

## 本地运行

```bash
npm install
npm run dev
```

提交前可运行 `npm test` 和 `npm run build` 检查内容与静态构建。

## 修改个人信息

站点名称、简介、导航和社交链接集中在 `src/data/site.ts`。只填写已经确认可以公开的信息；未提供邮箱或所在地时，页面会自动省略对应链接或文案。发布前请检查公开内容中没有模板编辑说明或默认联系方式，并确认项目描述与链接真实有效。

## 添加内容

- 长文：在 `src/content/articles/` 新建 `.md` 文件。
- 随笔：在 `src/content/notes/` 新建 `.md` 文件。
- 作品：在 `src/content/projects/` 新建 `.md` 文件。

文章和随笔的 front matter 示例：

```yaml
---
title: 标题
description: 一句话摘要
pubDate: 2026-08-01
tags: [写作]
draft: true
---
```

保留 `draft: true` 可让内容不出现在公开列表；准备发布时改为 `false`。作品字段请参考 `src/content/projects/` 中的示例。

## 发布

确认 `npm run build` 通过后提交并推送到 `main`。仓库配置好 GitHub Pages 工作流后，推送会自动发布新版本。
