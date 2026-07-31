# liuhaojie 的个人博客

一个使用 Astro 与 Markdown 维护的中文个人博客，包含文章、随笔和作品集。

## 本地运行

```bash
npm install
npm run dev
```

提交前可运行 `npm test` 和 `npm run build` 检查内容与静态构建。

## 修改个人信息

站点名称、简介、导航和社交链接集中在 `src/data/site.ts`。发布前请搜索“请替换”和“编辑提示”，换成真实的个人信息、邮箱、项目描述与链接。

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
